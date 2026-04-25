# Slack Order Notifications — Execution Plan

Send a Slack message to an internal channel whenever a customer completes checkout from `app/(customer)/schedule/steps/OrderSummary.tsx`.

---

## 1. Where the notification should fire (and why)

The "checkout" in `OrderSummary.tsx` actually runs through three stages:

1. User clicks **Pay** inside `CheckoutCTA.tsx` → mounts Stripe's `<EmbeddedCheckout />`.
2. Stripe processes the payment on its own servers.
3. Stripe calls our webhook at `app/api/webhooks/stripe/route.ts`, which invokes `fulfillCheckout()` in `server/services/fulfillment.ts`.

`fulfillCheckout()` is the single, idempotent "order placed" chokepoint — it:
- Checks `orders.stripeSessionId` to prevent duplicate processing.
- Verifies `session.payment_status !== "unpaid"`.
- Inserts the `orders` row.
- Activates the subscription (if applicable).
- Already sends `sendOrderConfirmation` (customer) and `sendAdminOrderNotification` (admin email).

**→ The Slack call goes here, as a sibling of `sendAdminOrderNotification`.** This guarantees:
- One Slack message per paid order (no duplicates on retries, no messages for abandoned/unpaid carts).
- We have the final `orderId`, DB-persisted address, items, and `totalAmount`.
- Free orders (`isFree: true` from the tRPC mutation) also flow through this path — see §6 for the edge case.

**Do NOT** fire from the client (`OrderSummary.tsx` / `CheckoutCTA.tsx`) — the client only *starts* checkout; it has no guarantee payment succeeded.

---

## 2. Slack App setup (Incoming Webhooks)

We only need one-way posts into a single channel, so **Incoming Webhooks** is the right primitive (no Bot Token, no OAuth flow, no scopes beyond `incoming-webhook`).

### Steps in the Slack UI

1. Go to <https://api.slack.com/apps> → **Create New App** → **From scratch**.
2. **App Name**: `David Returns Orders` (or similar). **Workspace**: pick the target workspace.
3. In the left sidebar → **Incoming Webhooks** → toggle **Activate Incoming Webhooks** to **On**.
4. Scroll down → **Add New Webhook to Workspace**.
5. Pick the channel the notifications should post into (e.g. `#orders`). Click **Allow**.
6. Copy the generated URL — it looks like `https://hooks.slack.com/services/T0XXXX/B0XXXX/XXXXXXXXXXXXXXXXXXXXXXXX`. Treat this as a **secret** (anyone with it can post to the channel).
7. In the left sidebar → **Basic Information** → optionally upload an app icon and set a display color.

### Optional polish

- **App Display Name**: set to `David Returns` so messages appear as "David Returns APP".
- **Default username**: e.g. `orders-bot`.
- If you want *multiple* channels (e.g. `#orders-prod` vs `#orders-staging`), click **Add New Webhook to Workspace** again and generate a second URL per env.

### Per-environment URLs

Generate **one webhook per environment** and store each in the corresponding Vercel environment:

| Environment | Channel suggestion | Env var value |
| ----- | ----- | ----- |
| Production | `#orders` | `https://hooks.slack.com/services/...` (live URL) |
| Preview | `#orders-staging` | separate URL, different channel |
| Development | leave unset | (falsy → code skips the call) |

---

## 3. Environment variables

Add **one** variable: `SLACK_ORDER_WEBHOOK_URL`.

### `lib/env.ts`

Append to `requiredEnvVars`:

```ts
// Slack (optional — if unset, notifications are silently skipped)
SLACK_ORDER_WEBHOOK_URL: process.env.SLACK_ORDER_WEBHOOK_URL,
```

Do **not** add it to the `missing` check — treat it as optional so local dev and preview deploys without Slack still work (the service module checks for presence at call time).

### `.env.example` (if present) / `.env.local`

```bash
# Slack Incoming Webhook for order notifications (optional)
SLACK_ORDER_WEBHOOK_URL=https://hooks.slack.com/services/T0XXXX/B0XXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

### Update the project rule

`/.cursor/rules/project.mdc` lists required env vars — add `SLACK_ORDER_WEBHOOK_URL` to the "Environment Variables" section (mark it as optional).

---

## 4. Code changes

### 4a. New file: `server/services/slack.ts`

Mirror the structure of `server/services/email.ts`: `"server-only"` import at top, single exported function, typed props, fire-and-log errors without throwing.

Key design choices:
- Use `fetch` (no new dependency — Slack Incoming Webhooks accept a plain JSON POST).
- Use **Block Kit** (`blocks` field) for rich formatting — headers, fields, buttons — rather than plain `text`.
- Include a fallback `text` for notification previews (mobile, desktop alerts).
- Tag the post with `isInstant`, `isMembership`, and any applied discount so ops sees urgent jobs at a glance.
- Link back to the admin dashboard URL (`${NEXT_PUBLIC_URL}/manage/orders/${orderId}`).
- Truncate item descriptions to keep the message scannable (Slack has a ~3000 char per block limit).

Function signature should be `sendSlackOrderNotification(props: SlackOrderNotificationProps)` where props extend the admin email props with:

```ts
type SlackOrderNotificationProps = {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  pickupDate: string
  pickupTime: string
  pickupMethod: string
  address: { street: string; apt?: string; city: string; zip: string }
  items: OrderItem[]        // full items array — shown as bullet list
  itemCount: number
  total: number              // cents
  isInstant: boolean
  isMembership: boolean
  discountApplied?: string   // display the code if one was used
}
```

Block Kit layout (top to bottom):

1. **Header block** — `":package: New Order #ABC12345"` (first 8 chars of orderId, uppercased).
2. **Context block** — badges: `INSTANT` (if applicable, red), `MEMBERSHIP` (if applicable, purple), discount code (if applied).
3. **Section with fields** (2-col) — customer name, email, phone, total (`$XX.XX`).
4. **Section with fields** (2-col) — pickup date, pickup time, pickup method, address.
5. **Section (items)** — up to ~10 items as a Markdown bulleted list, each `• {retailer or "Item"} — {description truncated to 60 chars}`; append `…and N more` if over 10.
6. **Actions block** — single button "View in Admin" linking to `${NEXT_PUBLIC_URL}/manage/orders/${orderId}`.
7. **Divider** to separate consecutive messages.

Error handling:
- If `SLACK_ORDER_WEBHOOK_URL` is unset → early return (no-op).
- If the POST returns non-2xx → `log.error` and **return** (do NOT throw). The Slack message is non-critical; a Slack outage must not prevent order fulfillment.

### 4b. Call site: `server/services/fulfillment.ts`

Inside the `try/catch` block where `sendAdminOrderNotification` is called (around line 161), add a sibling `try/catch` for Slack. Pattern to follow (the existing admin-email block is the template):

- Wrap the call in its own `try/catch` so a Slack failure doesn't swallow other notifications.
- Log via `log.error({ error, orderId: order.id }, "failed to send slack notification")`.
- Pass `isMembership` (already computed in the function), `orderData.items`, and the `discountApplied` value — for the last one, we need to read `session.total_details?.breakdown?.discounts` from the Stripe session, or pull it from our DB-persisted metadata if we stored it there. **Simplest path:** add the discount code to the metadata encoding in `server/services/stripeMetadata.ts` and surface it through `decodeOrderMetadata`. Alternatively, inspect `session.discounts` on the retrieved session.

### 4c. Metadata plumbing (if surfacing discount code)

If we want the discount code in the Slack message, check `server/services/stripeMetadata.ts` — if `discountCode` isn't already on `OrderMetadata`, add an optional `discountCode?: string` field to the `OrderMetadata` type and to `encodeOrderMetadata`. The checkout creation mutation (`trpc.stripe.createCheckout`) already receives `discountCode` as an input, so threading it through is mechanical.

Skip this step for v1 if you want to ship faster — the message is still useful without the code.

---

## 5. Message format example

What the on-call team will see in `#orders`:

> :package: **New Order #A1B2C3D4**
>
> `INSTANT` `MEMBERSHIP`
>
> **Customer**  Jane Doe        **Email**  jane@example.com
> **Phone**  (555) 123-4567     **Total**  $42.50
>
> **Pickup Date**  Mon, Apr 28, 2026    **Time**  9am–11am
> **Method**  Hand to us                **Address**  123 Main St, Apt 4B, Brooklyn, 11201
>
> *Items (3):*
> • Amazon — Logitech MX Master 3 wireless mouse…
> • Zappos — Hoka Clifton 9 size 10
> • Target — Kitchen towel set (6-pack)
>
> [ **View in Admin** ]
>
> ---

---

## 6. Edge cases & failure modes

| Scenario | Handling |
| ----- | ----- |
| Free order (discount 100% or membership covers) | `fulfillCheckout` still runs via the return-page tRPC mutation path; Slack fires normally. Total will be `$0.00`. |
| Duplicate webhook delivery | `fulfillCheckout` checks `existingOrder` first and short-circuits with `alreadyFulfilled: true` — Slack is *not* called in that branch. ✅ |
| Slack webhook returns 5xx / network error | Caught, logged, swallowed. Order fulfillment completes. No retry (acceptable for an internal notification). |
| `SLACK_ORDER_WEBHOOK_URL` unset in dev | `sendSlackOrderNotification` no-ops silently. |
| `items` array has 50+ entries | Truncated to 10 in the message with "…and N more" suffix. |
| Customer email missing | Pass `customerEmail || "(no email)"` — mirror how admin email already handles it. |
| Stripe session retrieval fails | `fulfillCheckout` throws before the Slack block is reached — webhook returns 500 and Stripe retries. No Slack spam. |

---

## 7. Implementation order (suggested PR breakdown)

1. **PR 1 — Slack service skeleton**
   - Create `server/services/slack.ts` with `sendSlackOrderNotification`.
   - Add `SLACK_ORDER_WEBHOOK_URL` to `lib/env.ts`.
   - Update `.cursor/rules/project.mdc` env var list.
   - No call site yet — mergeable on its own.

2. **PR 2 — Wire into fulfillment**
   - Call `sendSlackOrderNotification` from `fulfillCheckout` in its own try/catch.
   - Update `docs/SLACK_ORDER_NOTIFICATIONS.md` with the final message format if it drifts.

3. **PR 3 (optional) — Discount code surfacing**
   - Extend `OrderMetadata` + `encodeOrderMetadata` / `decodeOrderMetadata` to include `discountCode`.
   - Update checkout creation to pass it through.

---

## 8. Verification checklist

- [ ] `bun run build` passes (no TS errors after new service + env addition).
- [ ] `bun run lint` passes on `server/services/slack.ts` and `server/services/fulfillment.ts` (use `ReadLints`).
- [ ] Manual test: complete a **test-mode** Stripe checkout locally against the dev webhook endpoint (`bun run dev` + `stripe listen --forward-to localhost:3000/api/webhooks/stripe`) → confirm a Slack message lands in the test channel.
- [ ] Manual test: complete a **free** checkout (100% discount code) → confirm Slack still fires with `$0.00` total.
- [ ] Manual test: complete a **membership** checkout → confirm `MEMBERSHIP` badge appears.
- [ ] Simulate a duplicate webhook delivery (`stripe events resend evt_…`) → confirm **no** second Slack message (idempotency holds).
- [ ] Temporarily set `SLACK_ORDER_WEBHOOK_URL` to a bad URL → confirm order fulfillment still completes, error is logged, no 500 from the webhook route.
- [ ] Rotate the webhook URL in Slack admin once, confirm Vercel env var update propagates on next deploy.

---

## 9. Operational notes

- **Rotation**: if the webhook URL leaks, revoke it in Slack (App settings → Incoming Webhooks → trash icon next to the URL) and generate a new one; update `SLACK_ORDER_WEBHOOK_URL` in Vercel and redeploy.
- **Rate limits**: Slack Incoming Webhooks allow ~1 message/sec per webhook. Well below any realistic order volume, but keep in mind if we ever bulk-backfill old orders.
- **Thread replies / reactions**: not needed for v1. If ops wants to "claim" orders with an emoji reaction later, we'd need to upgrade to a real Bot Token with `chat:write` + `reactions:read`.
