# Slack Order Notifications — Execution Plan

Slack message to internal channel when customer completes checkout from `app/(customer)/schedule/steps/OrderSummary.tsx`.

---

## 1. Where the notification should fire (and why)

Checkout in `OrderSummary.tsx` runs three stages:

1. User clicks **Pay** in `CheckoutCTA.tsx` → mounts Stripe's `<EmbeddedCheckout />`.
2. Stripe processes payment on its servers.
3. Stripe calls webhook at `app/api/webhooks/stripe/route.ts` → invokes `fulfillCheckout()` in `server/services/fulfillment.ts`.

`fulfillCheckout()` is single idempotent "order placed" chokepoint:

- Check `orders.stripeSessionId` to prevent duplicates.
- Verify `session.payment_status !== "unpaid"`.
- Insert `orders` row.
- Activate subscription if applicable.
- Sends `sendOrderConfirmation` (customer) + `sendAdminOrderNotification` (admin email).

**→ Slack call goes here, sibling of `sendAdminOrderNotification`.** Guarantees:

- One Slack message per paid order (no duplicates on retries, no messages for abandoned/unpaid carts).
- Final `orderId`, DB-persisted address, items, `totalAmount` available.
- Free orders (`isFree: true` from tRPC mutation) flow through this path — see §6.

**Do NOT** fire from client (`OrderSummary.tsx` / `CheckoutCTA.tsx`) — client only *starts* checkout; no guarantee payment succeeded.

---

## 2. Slack App setup (Incoming Webhooks)

One-way posts to single channel → **Incoming Webhooks** is right primitive (no Bot Token, no OAuth, no scopes beyond `incoming-webhook`).

### Steps in the Slack UI

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**.
2. **Ap Name**: `David Returns Orders` (or similar). **Workspace**: pick target works**p**pace.
3. Left sidebar → **Incoming Webhooks** → toggle **Activate Incoming Webhooks** to **On**.
4. Scroll down → **Add New Webhook to Workspace**.
5. Pick channel for notifications (e.g. `#orders`). Click **Allow**.
6. Copy generated URL — looks like `https://hooks.slack.com/services/T0XXXX/B0XXXX/XXXXXXXXXXXXXXXXXXXXXXXX`. Treat as **secret** (anyone with it can post to channel).
7. Left sidebar → **Basic Information** → optionally upload app icon, set display color.

### Optional polish

- **App Display Name**: set to `David Returns` so messages show as "David Returns APP".
- **Default username**: e.g. `orders-bot`.
- For *multiple* channels (e.g. `#orders-prod` vs `#orders-staging`), click **Add New Webhook to Workspace** again, generate second URL per env.

### Per-environment URLs

Generate **one webhook per environment**, store each in corresponding Vercel environment:


| Environment | Channel suggestion | Env var value                                     |
| ----------- | ------------------ | ------------------------------------------------- |
| Production  | `#orders`          | `https://hooks.slack.com/services/...` (live URL) |
| Preview     | `#orders-staging`  | separate URL, different channel                   |
| Development | leave unset        | (falsy → code skips call)                         |


---

## 3. Environment variables

Add **one** variable: `SLACK_ORDER_WEBHOOK_URL`.

### `lib/env.ts`

Append to `requiredEnvVars`:

```ts
// Slack (optional — if unset, notifications are silently skipped)
SLACK_ORDER_WEBHOOK_URL: process.env.SLACK_ORDER_WEBHOOK_URL,
```

Do **not** add to `missing` check — treat as optional so local dev + preview deploys without Slack still work (service module checks presence at call time).

### `.env.example` (if present) / `.env.local`

```bash
# Slack Incoming Webhook for order notifications (optional)
SLACK_ORDER_WEBHOOK_URL=https://hooks.slack.com/services/T0XXXX/B0XXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

### Update the project rule

`/.cursor/rules/project.mdc` lists required env vars — add `SLACK_ORDER_WEBHOOK_URL` to "Environment Variables" section (mark optional).

---

## 4. Code changes

### 4a. New file: `server/services/slack.ts`

Mirror `server/services/email.ts` structure: `"server-only"` import at top, single exported function, typed props, fire-and-log errors, no throw.

Design choices:

- Use `fetch` (no new dep — Slack Incoming Webhooks accept plain JSON POST).
- Use **Block Kit** (`blocks` field) for rich formatting — headers, fields, buttons — not plain `text`.
- Include fallback `text` for notification previews (mobile, desktop alerts).
- Tag post with `isInstant`, `isMembership`, applied discount → ops sees urgent jobs at a glance.
- Link to admin dashboard URL (`${NEXT_PUBLIC_URL}/manage/orders/${orderId}`).
- Truncate item descriptions to keep message scannable (Slack has ~3000 char per block limit).

Function signature `sendSlackOrderNotification(props: SendSlackOrderNotificationProps)` — derive shape from Drizzle schemas, don't re-declare every column:

```ts
import type { Order } from "@/server/db/schema/orders"
import type { Profile } from "@/server/db/schema/profiles"

type SendSlackOrderNotificationProps = {
  order: Order                   // full row — pickupDate/Time/Method/address/items/isInstant/totalAmount
  profile: Profile | null        // fullName/email/phone for display
  customerEmail: string | null   // session.customer_email ?? profile.email (resolved at call site)
  isMembership: boolean          // runtime-only (session.mode === "subscription")
  discountApplied?: string       // runtime-only; leave undefined for v1
}
```

Inside the service, compute derived values (no props duplication):
- `customerName = profile?.fullName ?? order.address.fullName ?? "Customer"`
- `customerPhone = profile?.phone ?? order.address.phone ?? null`
- `itemCount = order.items.length`
- `addressLine = [street, apt, city, zip].filter(Boolean).join(", ")`
- `orderShort = order.id.slice(0, 8).toUpperCase()`
- `totalFormatted = \`$${(order.totalAmount / 100).toFixed(2)}\``

Block Kit layout (top to bottom):

1. **Header block** — `":package: New Order #ABC12345"` (first 8 chars of orderId, uppercased).
2. **Context block** — badges: `INSTANT` (if applicable, red), `MEMBERSHIP` (if applicable, purple), discount code (if applied).
3. **Section with fields** (2-col) — customer name, email, phone, total (`$XX.XX`).
4. **Section with fields** (2-col) — pickup date, pickup time, pickup method, address.
5. **Section (items)** — up to ~10 items as Markdown bullet list, each `• {retailer or "Item"} — {description truncated to 60 chars}`; append `…and N more` if over 10.
6. **Actions block** — single "View in Admin" button linking to `${NEXT_PUBLIC_URL}/manage/orders/${orderId}`.
7. **Divider** separating consecutive messages.

Error handling:

- If `SLACK_ORDER_WEBHOOK_URL` unset → early return (no-op).
- If POST returns non-2xx → `log.error` + **return** (do NOT throw). Slack message non-critical; Slack outage must not block order fulfillment.

### 4b. Call site: `server/services/fulfillment.ts`

Inside `try/catch` where `sendAdminOrderNotification` is called (around line 161), add sibling `try/catch` for Slack. Existing admin-email block is template:

- Wrap call in own `try/catch` so Slack failure doesn't swallow other notifications.
- Log via `log.error({ error, orderId: order.id }, "failed to send slack notification")`.
- Pass `isMembership` (already computed), `orderData.items`, `discountApplied` — for discount, read `session.total_details?.breakdown?.discounts` from Stripe session, or pull from DB-persisted metadata. **Simplest:** add discount code to metadata encoding in `server/services/stripeMetadata.ts`, surface via `decodeOrderMetadata`. Or inspect `session.discounts` on retrieved session.

### 4c. Metadata plumbing (if surfacing discount code)

For discount code in Slack message, check `server/services/stripeMetadata.ts` — if `discountCode` not on `OrderMetadata`, add optional `discountCode?: string` field to `OrderMetadata` type + `encodeOrderMetadata`. Checkout creation mutation (`trpc.stripe.createCheckout`) already receives `discountCode` as input → threading is mechanical.

Skip for v1 to ship faster — message still useful without code.

---

## 5. Message format example

On-call team will see in `#orders`:

> :package: **New Order #A1B2C3D4**
>
> `INSTANT` `MEMBERSHIP`
>
> **Customer**  Jane Doe        **Email**  [jane@example.com](mailto:jane@example.com)
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


| Scenario                                  | Handling                                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Free order (100% discount or membership)  | `fulfillCheckout` runs via return-page tRPC mutation path; Slack fires normally. Total `$0.00`.                                     |
| Duplicate webhook delivery                | `fulfillCheckout` checks `existingOrder` first, short-circuits with `alreadyFulfilled: true` — Slack *not* called in that branch. ✅ |
| Slack webhook returns 5xx / network error | Caught, logged, swallowed. Order fulfillment completes. No retry (OK for internal notification).                                    |
| `SLACK_ORDER_WEBHOOK_URL` unset in dev    | `sendSlackOrderNotification` no-ops silently.                                                                                       |
| `items` array has 50+ entries             | Truncated to 10 with "…and N more" suffix.                                                                                          |
| Customer email missing                    | Pass `customerEmail                                                                                                                 |
| Stripe session retrieval fails            | `fulfillCheckout` throws before Slack block — webhook returns 500, Stripe retries. No Slack spam.                                   |


---

## 7. Implementation order (suggested PR breakdown)

1. **PR 1 — Slack service skeleton**
  - Create `server/services/slack.ts` with `sendSlackOrderNotification`.
  - Add `SLACK_ORDER_WEBHOOK_URL` to `lib/env.ts`.
  - Update `.cursor/rules/project.mdc` env var list.
  - No call site yet — mergeable alone.
2. **PR 2 — Wire into fulfillment**
  - Call `sendSlackOrderNotification` from `fulfillCheckout` in own try/catch.
  - Update `docs/SLACK_ORDER_NOTIFICATIONS.md` with final message format if it drifts.
3. **PR 3 (optional) — Discount code surfacing**
  - Extend `OrderMetadata` + `encodeOrderMetadata` / `decodeOrderMetadata` to include `discountCode`.
  - Update checkout creation to pass through.

---

## 8. Verification checklist

- `bun run build` passes (no TS errors after new service + env addition).
- `bun run lint` passes on `server/services/slack.ts` + `server/services/fulfillment.ts` (use `ReadLints`).
- Manual: complete **test-mode** Stripe checkout locally against dev webhook (`bun run dev` + `stripe listen --forward-to localhost:3000/api/webhooks/stripe`) → confirm Slack message lands in test channel.
- Manual: complete **free** checkout (100% discount code) → confirm Slack fires with `$0.00` total.
- Manual: complete **membership** checkout → confirm `MEMBERSHIP` badge appears.
- Simulate duplicate webhook delivery (`stripe events resend evt_…`) → confirm **no** second Slack message (idempotency holds).
- Set `SLACK_ORDER_WEBHOOK_URL` to bad URL → confirm order fulfillment completes, error logged, no 500 from webhook route.
- Rotate webhook URL in Slack admin once → confirm Vercel env var update propagates on next deploy.

---

## 9. Operational notes

- **Rotation**: if webhook URL leaks, revoke in Slack (App settings → Incoming Webhooks → trash icon next to URL), generate new; update `SLACK_ORDER_WEBHOOK_URL` in Vercel, redeploy.
- **Rate limits**: Slack Incoming Webhooks allow ~1 message/sec per webhook. Well below realistic order volume; keep in mind for bulk-backfills.
- **Thread replies / reactions**: not needed for v1. For emoji-reaction "claim" workflow later, upgrade to real Bot Token with `chat:write` + `reactions:read`.

