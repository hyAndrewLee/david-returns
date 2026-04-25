# Welcome Email + Slack New-User Notification — Execution Plan

Fire welcome email to new user + Slack message to internal channel when customer completes signup flow started from `app/(auth)/signup/page.tsx`.

---

## 1. Where notification should fire (and why)

Signup in `app/(auth)/signup/page.tsx` runs three stages:

1. User submit form → `trpc.auth.signUp` mutation in `server/trpc/routers/auth.ts` calls `supabase.auth.signUp`. Supabase creates `auth.users` row (unconfirmed) + sends confirm email via its own SMTP.
2. User click confirm link in inbox → hits `app/(auth)/auth/confirm/route.ts` (`?token_hash=...&type=signup`).
3. Route call `supabase.auth.verifyOtp({ type: "signup", token_hash })`. Supabase flip `email_confirmed_at`, return `data.user`. Route redirect to `/auth/confirmed?status=success`.

Step 3 is single chokepoint where user becomes real. Fire welcome + Slack there, not at step 1. Reasons:

- Unconfirmed signups include spam, typos, bots. No welcome for them.
- `auth.users` row at step 1 may never confirm. Slack msg = noise.
- OTP single-use → Supabase invalidate on second click → idempotency free (second click returns error, control flow never reaches notify block).
- Profile row (`profiles` table) auto-created by Supabase trigger on `auth.users` insert (see `server/db/schema/profiles.ts` FK to `authUsers`). By step 3 profile exists → safe to read `fullName`, `email`, `phone`.

**→ Notify block go in `app/(auth)/auth/confirm/route.ts`, after successful `verifyOtp`, before redirect.**

**Do NOT** fire from tRPC `signUp` (pre-confirm). **Do NOT** fire from client — client never knows confirm completed.

Secondary callback `app/(auth)/auth/callback/route.ts` also handles `type=signup` via token_hash branch (line 98–128). For v1 skip — signup links from Supabase default template hit `/auth/confirm`, not `/auth/callback`. Audit Supabase email template URL after rollout; if both paths possible, extract shared helper.

---

## 2. Slack app setup

Reuse existing Slack app from order notifications (`docs/SLACK_ORDER_NOTIFICATIONS.md`) — same workspace, new webhook for separate channel.

### Steps

1. [https://api.slack.com/apps](https://api.slack.com/apps) → pick existing `David Returns Orders` app (or create `David Returns Users` if separation wanted).
2. Left sidebar → **Incoming Webhooks** → **Add New Webhook to Workspace**.
3. Pick channel (e.g. `#signups` or `#growth`). Click **Allow**.
4. Copy URL `https://hooks.slack.com/services/T0XXXX/B0YYYY/ZZZZZ`. Secret — anyone with URL can post.

### Per-env URLs

| Env         | Channel           | Var value                       |
| ----------- | ----------------- | ------------------------------- |
| Production  | `#signups`        | live URL in Vercel prod         |
| Preview     | `#signups-stg`    | separate URL, staging channel   |
| Development | unset             | code no-op                      |

---

## 3. Environment variables

Add **one** variable: `SLACK_SIGNUP_WEBHOOK_URL`. Separate from `SLACK_ORDER_WEBHOOK_URL` → channels stay independent, either can be toggled without affecting other.

### `lib/env.ts`

Append to `optionalEnvVars`:

```ts
  // Slack Incoming Webhook for signup notifications — unset = no-op in server/services/slack.ts.
  SLACK_SIGNUP_WEBHOOK_URL: process.env.SLACK_SIGNUP_WEBHOOK_URL,
```

Do **not** add to `requiredEnvVars` — optional, matches order-webhook precedent.

### `.env.local` / `.env.example`

```bash
# Slack Incoming Webhook for new-user signups (optional)
SLACK_SIGNUP_WEBHOOK_URL=https://hooks.slack.com/services/T0XXXX/B0YYYY/ZZZZZ
```

### Project rule

`.cursor/rules/project.mdc` → "Environment Variables" section → add `SLACK_SIGNUP_WEBHOOK_URL` next to `SLACK_ORDER_WEBHOOK_URL` (optional).

---

## 4. Code changes

### 4a. Extend `server/services/email.ts` — new `sendWelcomeEmail`

Add new exported fn next to `sendOrderConfirmation`. Mirror its structure: `"server-only"` already imported at top, `Resend` already instantiated, reuse `from: "David Returns <hello@davidreturns.com>"`.

Signature:

```ts
type WelcomeEmailProps = {
  customerEmail: string
  customerName: string
}

export const sendWelcomeEmail = async ({ customerEmail, customerName }: WelcomeEmailProps) => {
  // ...
}
```

Content outline (inline HTML template, no React Email — match existing file style):

- Header bar (black bg, white text): "Welcome to David Returns"
- Greeting: `Hi ${firstName},` (split `customerName` on first space, fallback to full name if no space)
- Body paragraph: "You're in. Schedule your first pickup and skip the line for good."
- "What's next" section — 3 bullets:
  - "Pack your returns — labels or not, we handle it."
  - "Pick a time — morning, afternoon, or instant."
  - "Hand off or leave at door — your call."
- CTA button "Schedule a Pickup" → `${NEXT_PUBLIC_URL}/schedule`
- Secondary link "Or visit your dashboard" → `/dashboard`
- Footer: copyright, support email `hello@davidreturns.com`

From: `"David Returns <hello@davidreturns.com>"`.
Subject: `"Welcome to David Returns — your first pickup awaits"`.
Error path: `console.error("Resend welcome error:", error); throw error` — same as `sendOrderConfirmation` line 98–100. Caller wraps in try/catch.

### 4b. Extend `server/services/slack.ts` — new `sendSlackNewUserNotification`

Add fn next to `sendSlackOrderNotification`. Mirror: `"server-only"`, `fetch` webhook, Block Kit blocks, `log.error` on non-2xx, swallow error (never throw).

Signature:

```ts
type SendSlackNewUserNotificationProps = {
  userId: string
  email: string
  fullName: string | null
  phone: string | null
  address: {
    street: string | null
    apt: string | null
    city: string | null
    zip: string | null
  } | null
}

export const sendSlackNewUserNotification = async (
  props: SendSlackNewUserNotificationProps,
): Promise<void> => {
  const webhookUrl = process.env.SLACK_SIGNUP_WEBHOOK_URL
  if (!webhookUrl) return
  // ...
}
```

Block Kit layout (top to bottom):

1. **Header** — `":wave: New User Signup"`.
2. **Section fields** (2-col) — Name, Email, Phone, User ID (first 8 chars).
3. **Section fields** (2-col) — Street, Apt, City, ZIP (skip fields if null).
4. **Actions** — single "View in Supabase" button → `https://supabase.com/dashboard/project/<PROJECT_REF>/auth/users?search=${encodeURIComponent(email)}`. Project ref from `NEXT_PUBLIC_SUPABASE_URL` (parse subdomain) or hardcode after verify — cleaner: derive once at module top.
5. **Divider**.

Fallback text: `New signup — ${fullName || email}`.

Same truncate helper reusable — already exported internally as const, leave it, do not export unless needed.

### 4c. New orchestrator: `server/services/userNotifications.ts`

Mirror `server/services/orderNotifications.ts` one-to-one. Single fn combine both notifier calls, each wrapped own try/catch so one failure never blocks other.

```ts
import "server-only"

import { eq } from "drizzle-orm"
import { adminDb } from "@/server/db"
import { profiles } from "@/server/db/schema"
import { sendWelcomeEmail } from "@/server/services/email"
import { sendSlackNewUserNotification } from "@/server/services/slack"
import { createLogger } from "@/lib/logger"

const log = createLogger("user-notifications")

type NotifyUserSignedUpProps = {
  userId: string
  email: string
}

export const notifyUserSignedUp = async ({
  userId,
  email,
}: NotifyUserSignedUpProps): Promise<void> => {
  const [profile] = await adminDb
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  const fullName = profile?.fullName ?? null
  const phone = profile?.phone ?? null

  try {
    await sendWelcomeEmail({
      customerEmail: email,
      customerName: fullName ?? "there",
    })
  } catch (error) {
    log.error({ error, userId }, "failed to send welcome email")
  }

  try {
    await sendSlackNewUserNotification({
      userId,
      email,
      fullName,
      phone,
      address: null, // profile table has no address — see §4d
    })
  } catch (error) {
    log.error({ error, userId }, "failed to send slack signup notification")
  }
}
```

### 4d. Address in Slack msg — optional enhancement

`profiles` schema has no address columns (see `server/db/schema/profiles.ts`). Signup form collects street/apt/city/zip → tRPC `signUp` pass as `options.data` to Supabase → lands in `auth.users.raw_user_meta_data`. NOT queryable via `profiles` table.

Two options:

- **v1 (simplest)**: Slack msg omit address. `address: null` in props, skip fields block if null.
- **v2 (richer)**: Query `auth.users.raw_user_meta_data` via service-role Supabase client, extract `street_address`/`apt`/`city`/`zip`. Do in `notifyUserSignedUp` before calling Slack. Needs `createAdminClient` from `lib/supabase/admin.ts`:

```ts
const supabaseAdmin = createAdminClient()
const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
const meta = authUser?.user?.user_metadata as Record<string, string> | undefined
const address = meta
  ? {
      street: meta.street_address ?? null,
      apt: meta.apt ?? null,
      city: meta.city ?? null,
      zip: meta.zip ?? null,
    }
  : null
```

Ship v1 first. v2 trivial follow-up.

### 4e. Wire into `app/(auth)/auth/confirm/route.ts`

After successful `verifyOtp` (line 37–40), before redirect (line 64–68), insert notify call:

```ts
// after: if (!data.user) { ... return ... } block (line 52–60)

try {
  await notifyUserSignedUp({
    userId: data.user.id,
    email: data.user.email ?? "",
  })
} catch (error) {
  console.error(`[v0][${debugId}] notify block threw (should not happen):`, error)
}
```

Outer try/catch in route (line 6 / 69) already swallow exceptions → double-safety not needed, but keep inner try/catch so notify failure log clean + debug_id preserved. `notifyUserSignedUp` itself already swallow inner errors — outer try here is defensive.

Add import at top of route:

```ts
import { notifyUserSignedUp } from "@/server/services/userNotifications"
```

### 4f. Secondary path: `app/(auth)/auth/callback/route.ts`

Branch at line 98 handles `token_hash` + `type === "signup"` — same verifyOtp. If Supabase email template point there, welcome never fire. Audit before ship:

1. Check Supabase dashboard → Authentication → Email Templates → Confirm Signup → URL pattern. If `{{ .SiteURL }}/auth/confirm?...` → only `/auth/confirm` hit. If `/auth/callback?...` → also wire there.
2. If both possible, extract notify call to helper, call from both routes. Idempotency still holds (OTP single-use).

For this plan assume `/auth/confirm` only. Verify step in §7.

---

## 5. Welcome email sample

```
Subject: Welcome to David Returns — your first pickup awaits

Hi Jane,

You're in. Schedule your first pickup and skip the line for good.

What's next
  • Pack your returns — labels or not, we handle it.
  • Pick a time — morning, afternoon, or instant.
  • Hand off or leave at door — your call.

[ Schedule a Pickup ]   ← /schedule

Or visit your dashboard → /dashboard

Questions? Just reply.
hello@davidreturns.com
```

## 6. Slack message sample

```
:wave: New User Signup

*Name*            *Email*
Jane Doe          jane@example.com

*Phone*           *User ID*
(555) 123-4567    a1b2c3d4

*Street*          *Apt*
123 Main St       4B

*City*            *ZIP*
Brooklyn          11201

[ View in Supabase ]
```

---

## 7. Edge cases & failure modes

| Scenario                                    | Handling                                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| User click confirm link twice               | OTP single-use → Supabase `verifyOtp` return error on 2nd call → notify block never runs. No dupe. ✅ |
| Resend API down / 5xx                       | `sendWelcomeEmail` throw → outer try/catch in `notifyUserSignedUp` log + swallow. Slack still fires. |
| Slack webhook 5xx / network error           | Caught in `sendSlackNewUserNotification`, logged, swallowed. Welcome email still fires.              |
| `SLACK_SIGNUP_WEBHOOK_URL` unset (dev/local)| `sendSlackNewUserNotification` early return (no-op).                                                 |
| Profile row not yet created (race)          | Supabase trigger on `auth.users` insert run sync before `signUp` return. By confirm step guaranteed. |
| `data.user.email` null                      | Supabase always populate on signup flow. Defensive `?? ""` in props; Resend throw on empty → logged. |
| User confirm old link after profile deleted | `profiles` row absent → `fullName`/`phone` null → msg say "there" + email only. No crash.            |
| Supabase email redirect point to `/auth/callback` | §4f — add same notify call to callback route's signup branch.                                  |
| Spam / disposable email signup              | Welcome + Slack still fire (already email-verified at this point). Rate-limit at Supabase Auth.      |

---

## 8. Implementation order (suggested PR breakdown)

1. **PR 1 — email template**
   - Add `sendWelcomeEmail` to `server/services/email.ts`.
   - No call site yet. Unit-test by hitting `resend.emails.send` via scratch script if doubt. Mergeable alone.

2. **PR 2 — Slack fn + env wiring**
   - Add `sendSlackNewUserNotification` to `server/services/slack.ts`.
   - Add `SLACK_SIGNUP_WEBHOOK_URL` to `lib/env.ts` `optionalEnvVars`.
   - Update `.cursor/rules/project.mdc` env var list.
   - No call site yet.

3. **PR 3 — orchestrator + wire into confirm route**
   - Create `server/services/userNotifications.ts`.
   - Import + call `notifyUserSignedUp` in `app/(auth)/auth/confirm/route.ts`.
   - End-to-end live.

4. **PR 4 (optional) — address in Slack msg**
   - Query `auth.users.raw_user_meta_data` via admin client in orchestrator.
   - Pass `address` to Slack fn instead of `null`.

5. **PR 5 (optional) — mirror into `/auth/callback` route**
   - If audit in §7 show both paths possible, wire same notify call.

---

## 9. Verification checklist

- `bun run build` passes (no TS errors after new service + env).
- `bun run lint` passes on touched files (`ReadLints` on email.ts, slack.ts, userNotifications.ts, confirm/route.ts).
- Confirm Supabase email template URL — dashboard → Auth → Email Templates → "Confirm signup". Verify link path match `/auth/confirm`.
- Manual: signup with fresh email locally (`bun run dev`) → check inbox → click link → confirm redirect to `/auth/confirmed?status=success`.
- Manual: welcome email arrives at signup address within ~10s of confirm click. Check Resend dashboard for delivery log.
- Manual: Slack msg lands in test channel with correct name, email, phone.
- Click confirm link **second time** → verify 2nd click redirect to error page, **no** second welcome email, **no** second Slack msg.
- Unset `SLACK_SIGNUP_WEBHOOK_URL` locally → signup+confirm still succeed, welcome email still fires, Slack silent.
- Break `RESEND_API_KEY` (bad key) → confirm Slack still fires, welcome fails, error logged, user still see success redirect.
- Rate-limit check: 3 rapid signups in a row → 3 Slack msgs, 3 emails, no duplicates.

---

## 10. Operational notes

- **Rotation**: if `SLACK_SIGNUP_WEBHOOK_URL` leak, revoke in Slack app settings → Incoming Webhooks → trash → regenerate → update Vercel env → redeploy.
- **Unsubscribe**: welcome email transactional, no unsubscribe link needed (CAN-SPAM exempts transactional). Still add `hello@davidreturns.com` reply-to for opt-out requests.
- **Resend domain**: `hello@davidreturns.com` must be verified sender in Resend. Reuse existing domain setup from order emails.
- **Metrics**: Resend dashboard shows delivery + open rates. Slack msg count = signup confirmation rate proxy.
- **Future — React Email**: `@react-email/render` already in deps (see project rule). If welcome template grow complex, migrate to React Email component alongside other templates. For v1 inline HTML fine.
