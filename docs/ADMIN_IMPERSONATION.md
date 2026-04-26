# Admin Impersonation — Execution Plan

Lets admin "view as customer" from `app/(admin)/manage/dashboard/page.tsx`. Click row in customers tab → land on `/dashboard` as that user → banner everywhere → "Stop Impersonating" → restore admin.

Built MVC-style: tRPC router = thin controller, `server/services/*` = business logic, new `server/repositories/*` = DB access. No DB calls inside routers or services.

---

## 1. Auth model recap (read first)

Two cookie tracks, independent:

- `admin_session=authenticated` — env-password admin (set by `admin.login` mutation, `server/trpc/routers/admin.ts:24`). Read by `proxy.ts` → `server/auth/middleware.ts:39` and by `adminProcedure` (`server/trpc/middlewares.ts:26`).
- Supabase SSR cookies (`sb-*`) — real customer session. Read by `createServerSupabaseClient` and middleware `supabase.auth.getUser()` (`middleware.ts:30`). Used by `/dashboard`, `/orders`, `/profile`, `/schedule`.

`adminProcedure` accepts EITHER `admin_session` cookie OR Supabase user with `profiles.is_admin=true`. Both tracks coexist on same browser.

**Key insight**: impersonation = put a real customer Supabase session into the browser **on top of** the `admin_session` cookie. Customer pages key off `auth.uid()` → see customer data. Admin pages key off `admin_session` → still see admin. Stop = clear Supabase session, keep `admin_session`.

---

## 2. Approach options

| Option | How | Verdict |
|---|---|---|
| A. JWT swap | Mint customer JWT with service role, write `sb-*` cookies manually | Fragile, breaks on JWT rotation |
| B. Magic link OTP | `auth.admin.generateLink({ type: 'magiclink' })` → `verifyOtp` server-side → set cookies | Officially supported, single-use token, audit-friendly |
| C. RLS bypass + UI fake | Pass `viewAsUserId` to every query | Rewrites every customer route + RLS policy. Reject |

**Pick B**.

---

## 3. Layered architecture

```
app/(admin)/manage/dashboard/page.tsx          ← view (RSC)
components/admin/AdminCustomersTab.tsx         ← view (button)
components/admin/ImpersonationBanner.tsx       ← view (banner)
        │ calls
        ▼
server/trpc/routers/admin.ts                   ← controller (thin)
        │ delegates
        ▼
server/services/impersonation.ts               ← service (biz logic, orchestration)
        │ calls
        ▼
server/repositories/profilesRepo.ts            ← repo (drizzle queries)
server/repositories/impersonationAuditRepo.ts  ← repo (drizzle queries)
server/auth/supabase.ts                        ← infra (Supabase client factory)
```

Rules:

- **Router** does input validation, auth check (via `adminProcedure`), maps service result → response/error. Zero DB calls. Zero Supabase calls. Zero `cookies()` calls except for setting/deleting impersonation flag (cookie is HTTP-layer concern, controller's job).
- **Service** receives plain inputs, orchestrates: calls repos for DB, calls Supabase admin client for auth ops. Returns plain DTOs or throws domain errors. Zero `cookies()` access. Zero `TRPCError`.
- **Repo** receives plain inputs, returns plain rows or domain entities. Zero biz logic. Zero error wrapping beyond drizzle's. One file per aggregate.

Same convention as existing `server/services/orderNotifications.ts` + `server/services/fulfillment.ts`. Repos new — current code accesses `adminDb` from services directly. We introduce repo layer for impersonation; backfill other domains separately if desired.

---

## 4. Repository layer

### 4a. `server/repositories/profilesRepo.ts`

```ts
import "server-only";
import { eq } from "drizzle-orm";
import { adminDb } from "@/server/db";
import { profiles } from "@/server/db/schema";

export type ProfileEmailRow = { id: string; email: string | null; fullName: string | null };

export const findProfileEmailById = async (id: string): Promise<ProfileEmailRow | null> => {
  const [row] = await adminDb
    .select({ id: profiles.id, email: profiles.email, fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return row ?? null;
};
```

Existing services (e.g. `orderNotifications.ts:30`) duplicate this lookup inline. Migrate later — out of scope.

### 4b. `server/repositories/impersonationAuditRepo.ts`

```ts
import "server-only";
import { adminDb } from "@/server/db";
import { impersonationAudit } from "@/server/db/schema";

export type AuditAction = "start" | "stop";

export type RecordAuditParams = {
  customerId: string;
  adminIdentifier: string;
  action: AuditAction;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export const recordImpersonationAudit = async (params: RecordAuditParams): Promise<void> => {
  await adminDb.insert(impersonationAudit).values(params);
};
```

### 4c. Schema `server/db/schema/impersonationAudit.ts`

```ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const impersonationAudit = pgTable("impersonation_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull(),
  adminIdentifier: text("admin_identifier").notNull(), // 'env_admin' or admin user uuid
  action: text("action", { enum: ["start", "stop"] }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ImpersonationAudit = typeof impersonationAudit.$inferSelect;
export type NewImpersonationAudit = typeof impersonationAudit.$inferInsert;
```

Export from `server/db/schema/index.ts`. Migration via drizzle-kit: `bun drizzle-kit generate`.

---

## 5. Service layer

### `server/services/impersonation.ts`

Pure orchestration. No HTTP, no cookies. Returns DTOs. Throws typed errors that controller maps to `TRPCError`.

```ts
import "server-only";

import { createAdminSupabaseClient, createServerSupabaseClient } from "@/server/auth/supabase";
import { findProfileEmailById } from "@/server/repositories/profilesRepo";
import { recordImpersonationAudit } from "@/server/repositories/impersonationAuditRepo";
import { createLogger } from "@/lib/logger";

const log = createLogger("impersonation");

export class ImpersonationError extends Error {
  constructor(public code: "CUSTOMER_NOT_FOUND" | "NO_EMAIL" | "LINK_FAILED" | "VERIFY_FAILED", message: string) {
    super(message);
    this.name = "ImpersonationError";
  }
}

type StartImpersonationParams = {
  customerId: string;
  adminIdentifier: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type StartImpersonationResult = {
  customerId: string;
  redirectUrl: string;
};

export const startImpersonation = async (
  params: StartImpersonationParams,
): Promise<StartImpersonationResult> => {
  const customer = await findProfileEmailById(params.customerId);
  if (!customer) throw new ImpersonationError("CUSTOMER_NOT_FOUND", "Customer not found");
  if (!customer.email) throw new ImpersonationError("NO_EMAIL", "Customer has no email");

  const adminClient = createAdminSupabaseClient();
  const { data: link, error: linkErr } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: customer.email,
  });
  if (linkErr || !link?.properties?.hashed_token) {
    log.error({ err: linkErr, customerId: params.customerId }, "generateLink failed");
    throw new ImpersonationError("LINK_FAILED", linkErr?.message ?? "generateLink failed");
  }

  const ssrClient = await createServerSupabaseClient();
  const { error: verifyErr } = await ssrClient.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (verifyErr) {
    log.error({ err: verifyErr, customerId: params.customerId }, "verifyOtp failed");
    throw new ImpersonationError("VERIFY_FAILED", verifyErr.message);
  }

  await recordImpersonationAudit({
    customerId: params.customerId,
    adminIdentifier: params.adminIdentifier,
    action: "start",
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
  });

  log.info({ customerId: params.customerId, admin: params.adminIdentifier }, "impersonation started");
  return { customerId: params.customerId, redirectUrl: "/dashboard" };
};

type StopImpersonationParams = {
  customerId: string | null;
  adminIdentifier: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type StopImpersonationResult = { redirectUrl: string };

export const stopImpersonation = async (
  params: StopImpersonationParams,
): Promise<StopImpersonationResult> => {
  const ssrClient = await createServerSupabaseClient();
  await ssrClient.auth.signOut(); // clears sb-* cookies

  if (params.customerId) {
    await recordImpersonationAudit({
      customerId: params.customerId,
      adminIdentifier: params.adminIdentifier,
      action: "stop",
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  }

  log.info({ customerId: params.customerId, admin: params.adminIdentifier }, "impersonation stopped");
  return { redirectUrl: "/manage/dashboard" };
};
```

`createServerSupabaseClient()` writes `sb-*` cookies via the request's cookie store as a side effect of `verifyOtp` / `signOut`. Caller (Next.js) commits cookies on response. Service stays HTTP-agnostic in spirit — it never reads/writes cookies by name, only delegates to the Supabase SSR client which Next wires up.

---

## 6. Controller layer (router)

### `server/trpc/routers/admin.ts` — additions

```ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { adminProcedure } from "../middlewares";
import { startImpersonation, stopImpersonation, ImpersonationError } from "@/server/services/impersonation";

const IMPERSONATION_COOKIE = "impersonating_user_id";
const IMPERSONATION_MAX_AGE = 60 * 60 * 4; // 4h

const mapImpersonationError = (e: unknown): never => {
  if (e instanceof ImpersonationError) {
    const code =
      e.code === "CUSTOMER_NOT_FOUND" ? "NOT_FOUND"
      : e.code === "NO_EMAIL" ? "BAD_REQUEST"
      : "INTERNAL_SERVER_ERROR";
    throw new TRPCError({ code, message: e.message });
  }
  throw e;
};

const getAdminIdentifier = (ctx: { session?: { user?: { id: string } } | null }): string =>
  ctx.session?.user?.id ?? "env_admin";

// inside createTRPCRouter({...})
impersonate: adminProcedure
  .input(z.object({ customerId: z.string().uuid() }))
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await startImpersonation({
        customerId: input.customerId,
        adminIdentifier: getAdminIdentifier(ctx),
        ipAddress: ctx.headers?.get?.("x-forwarded-for") ?? null,
        userAgent: ctx.headers?.get?.("user-agent") ?? null,
      });
      const cookieStore = await cookies();
      cookieStore.set(IMPERSONATION_COOKIE, result.customerId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: IMPERSONATION_MAX_AGE,
        path: "/",
      });
      return { redirectUrl: result.redirectUrl };
    } catch (e) {
      mapImpersonationError(e);
    }
  }),

stopImpersonation: adminProcedure.mutation(async ({ ctx }) => {
  const cookieStore = await cookies();
  const customerId = cookieStore.get(IMPERSONATION_COOKIE)?.value ?? null;

  const result = await stopImpersonation({
    customerId,
    adminIdentifier: getAdminIdentifier(ctx),
    ipAddress: ctx.headers?.get?.("x-forwarded-for") ?? null,
    userAgent: ctx.headers?.get?.("user-agent") ?? null,
  });

  cookieStore.delete(IMPERSONATION_COOKIE);
  return { redirectUrl: result.redirectUrl };
}),
```

Verify `ctx.headers` exists in `server/trpc/init.ts`. If not, add it in context creation — needed for IP/UA capture in audit log.

Controller responsibilities here:
- Validate input (`z.object`)
- Auth gate (`adminProcedure`)
- Pull admin identity + request metadata from ctx
- Call service
- Translate service errors → HTTP/tRPC errors
- Set/delete cookie (HTTP concern)
- Return response shape to client

Zero DB. Zero Supabase. Zero biz logic.

---

## 7. View layer

### 7a. Customers tab — Impersonate button

`components/admin/AdminCustomersTab.tsx`: add sibling to Trash button (line 107):

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleImpersonate(customer.id)}
  disabled={impersonatingId === customer.id}
>
  <UserCog className="h-4 w-4" />
</Button>
```

Wire `handleImpersonate` + `impersonatingId` in `AdminDashboardContext.tsx` (per project Context-not-prop-drill rule):

```ts
const impersonateMutation = trpc.admin.impersonate.useMutation();
const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

const handleImpersonate = useCallback(async (customerId: string) => {
  setImpersonatingId(customerId);
  try {
    const { redirectUrl } = await impersonateMutation.mutateAsync({ customerId });
    window.location.href = redirectUrl; // hard nav — cookies must roundtrip
  } catch (e) {
    setImpersonatingId(null);
    alert(`Impersonation failed: ${e instanceof Error ? e.message : "unknown"}`);
  }
}, [impersonateMutation]);
```

Hard nav (`window.location.href`), not `router.push`. Server set `sb-*` cookies; client tRPC cache + Supabase browser client must reload to pick up new session.

Add `handleImpersonate`, `impersonatingId` to context value + memo deps.

### 7b. Banner

`components/admin/ImpersonationBanner.tsx` — server component, reads cookie, calls **repo** for name (not direct `adminDb`):

```tsx
import { cookies } from "next/headers";
import { findProfileEmailById } from "@/server/repositories/profilesRepo";
import { StopImpersonatingButton } from "./StopImpersonatingButton";

export const ImpersonationBanner = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("impersonating_user_id")?.value;
  if (!userId) return null;

  const customer = await findProfileEmailById(userId);

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-sm text-amber-950">
      <span>
        Viewing as <strong>{customer?.fullName ?? customer?.email ?? userId}</strong>
      </span>
      <StopImpersonatingButton />
    </div>
  );
};
```

Mount in `app/layout.tsx` body, above `<TRPCProvider>`. Returns `null` when no cookie → zero cost normal flow.

`StopImpersonatingButton.tsx` — client:

```tsx
"use client";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc";

export const StopImpersonatingButton = () => {
  const stopMutation = trpc.admin.stopImpersonation.useMutation();
  const handleStop = async () => {
    const { redirectUrl } = await stopMutation.mutateAsync();
    window.location.href = redirectUrl;
  };
  return <Button size="sm" variant="outline" onClick={handleStop}>Stop Impersonating</Button>;
};
```

### 7c. Proxy adjustment

`server/auth/middleware.ts`, before `/manage` block (line 38):

```ts
const impersonating = request.cookies.get("impersonating_user_id");
if (impersonating && request.nextUrl.pathname.startsWith("/manage")) {
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  return NextResponse.redirect(url);
}
```

Prevents split-brain UX.

---

## 8. Security

| Risk | Mitigation |
|---|---|
| Token leak | `hashed_token` only used server-side, never crosses wire |
| Long session | `impersonating_user_id` cookie maxAge 4h. Supabase session expiry per project setting |
| Admin-as-customer order | Service can be extended: pass `impersonated_by` flag in ctx → orders router writes Stripe metadata `impersonated_by=<adminId>` when cookie set. Out of scope v1 |
| Service role exposure | `createAdminSupabaseClient` server-only; verified via `import "server-only"` in service + repo files |
| Tab close mid-impersonation | Customer's Supabase session persists. Mitigation: `/manage/login` page calls `stopImpersonation` if cookie present before render. v1.1 |
| Audit gap if `env_admin` | `adminIdentifier='env_admin'` placeholder. Doc tradeoff — env-password track has no identity |
| RLS write through impersonation | Admin can write as customer (place order, edit address). Acceptable for support; documented. Read-only mode out of scope |

---

## 9. Edge cases

- Customer email unconfirmed → `generateLink` errors → `ImpersonationError("LINK_FAILED")` → `INTERNAL_SERVER_ERROR` toast.
- Customer deleted between row click and mutation → repo returns `null` → `CUSTOMER_NOT_FOUND` → 404.
- Real-time channels in `AdminDashboardContext:122` keep running on hard nav — fine, browser tears down on navigation.
- Stripe webhooks fire under customer userId — correct, orders are theirs.
- Two browser tabs, one impersonating, one not → cookies are origin-wide → not possible. Document.

---

## 10. Implementation checklist

Order matters — bottom-up, controllers depend on services depend on repos.

- [ ] Schema: `server/db/schema/impersonationAudit.ts` + export from `index.ts`
- [ ] Migration: `bun drizzle-kit generate` → review SQL → `bun drizzle-kit migrate`
- [ ] Repo: `server/repositories/impersonationAuditRepo.ts`
- [ ] Repo: `server/repositories/profilesRepo.ts` (`findProfileEmailById`)
- [ ] Service: `server/services/impersonation.ts` (`startImpersonation`, `stopImpersonation`, `ImpersonationError`)
- [ ] Verify `ctx.headers` available in `server/trpc/init.ts`; add if missing
- [ ] Controller: `impersonate` + `stopImpersonation` mutations in `server/trpc/routers/admin.ts`
- [ ] Proxy: cookie redirect in `server/auth/middleware.ts`
- [ ] Context: `handleImpersonate` + `impersonatingId` in `AdminDashboardContext.tsx`
- [ ] View: button in `AdminCustomersTab.tsx`
- [ ] View: `components/admin/ImpersonationBanner.tsx` (RSC) + `StopImpersonatingButton.tsx` (client)
- [ ] Mount banner in `app/layout.tsx`
- [ ] `bun run lint` + `bun run build`
- [ ] Manual QA: impersonate → navigate `/dashboard`, `/orders`, `/profile` → stop → verify admin restored, two audit rows present

---

## 11. Out of scope (v1.1+)

- Stripe metadata `impersonated_by` on orders created mid-impersonation
- Auto-cleanup cookie on `/manage/login` GET
- Read-only impersonation (RLS write block via SQL helper reading JWT claim)
- Backfill repo layer for orders, addresses, subscriptions, profiles (currently all live in services + routers via `adminDb`)
- Time-boxed forced expiry beyond cookie maxAge
- Impersonating other admin profiles
