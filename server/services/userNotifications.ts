import "server-only"

import type { User } from "@supabase/supabase-js"
import { eq } from "drizzle-orm"
import { adminDb } from "@/server/db"
import { profiles } from "@/server/db/schema"
import { createAdminSupabaseClient } from "@/server/auth/supabase"
import { sendWelcomeEmail } from "@/server/services/email"
import { sendSlackNewUserNotification, type SignupAddress } from "@/server/services/slack"
import { createLogger } from "@/lib/logger"

const log = createLogger("user-notifications")

type NotifyUserSignedUpProps = {
  userId: string
  email: string
}

const FRESH_CONFIRM_WINDOW_MS = 10 * 60_000

const extractAddressFromMetadata = (
  metadata: Record<string, unknown> | null | undefined,
): SignupAddress | null => {
  if (!metadata) return null
  const get = (key: string): string | null => {
    const value = metadata[key]
    return typeof value === "string" && value.trim() !== "" ? value : null
  }
  const address: SignupAddress = {
    street: get("street_address"),
    apt: get("apt"),
    city: get("city"),
    zip: get("zip"),
  }
  const hasAny = Object.values(address).some((part) => part !== null)
  return hasAny ? address : null
}

/**
 * Fires all external notifications for a newly-confirmed user.
 * Prefer `tryNotifySignup(user, debugId)` at call sites — it applies the
 * freshness guard so later magic-link / OAuth logins don't re-fire welcome.
 * Each notifier is wrapped in its own try/catch — one failure never blocks others.
 */
export const notifyUserSignedUp = async ({
  userId,
  email,
}: NotifyUserSignedUpProps): Promise<void> => {
  if (!email) {
    log.error({ userId }, "notifyUserSignedUp called without email; skipping")
    return
  }

  log.info({ userId, email }, "notifyUserSignedUp start")

  const [profile] = await adminDb
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  let address: SignupAddress | null = null
  try {
    const supabaseAdmin = createAdminSupabaseClient()
    const { data: authData, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (error) {
      log.error({ error, userId }, "failed to read auth.users metadata")
    } else {
      address = extractAddressFromMetadata(authData.user?.user_metadata)
    }
  } catch (error) {
    log.error({ error, userId }, "failed to create admin client for signup notify")
  }

  const customerName = profile?.fullName ?? ""

  try {
    const result = await sendWelcomeEmail({ customerEmail: email, customerName })
    log.info({ userId, resendId: result?.id }, "welcome email sent")
  } catch (error) {
    log.error({ error, userId }, "failed to send welcome email")
  }

  try {
    await sendSlackNewUserNotification({
      userId,
      email,
      profile: profile ?? null,
      address,
    })
  } catch (error) {
    log.error({ error, userId }, "failed to send slack signup notification")
  }
}

/**
 * Call-site wrapper that applies the freshness guard and swallows all errors.
 * A user is "freshly confirmed" when email_confirmed_at is within the last
 * 10 minutes — true for the signup-confirm click, false for later logins.
 * Safe to call unconditionally from any auth-callback path.
 */
export const tryNotifySignup = async (
  user: User | null,
  debugId?: string,
): Promise<void> => {
  if (!user) return

  // Session's user payload may lag; re-read from admin API for fresh timestamps.
  let confirmedAtRaw: string | null | undefined = user.email_confirmed_at
  let email = user.email ?? ""

  if (!confirmedAtRaw || !email) {
    try {
      const supabaseAdmin = createAdminSupabaseClient()
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(user.id)
      if (error) {
        log.error({ error, userId: user.id, debugId }, "tryNotifySignup: admin getUserById failed")
      } else {
        confirmedAtRaw = data.user?.email_confirmed_at ?? confirmedAtRaw
        email = data.user?.email ?? email
      }
    } catch (error) {
      log.error({ error, userId: user.id, debugId }, "tryNotifySignup: admin client threw")
    }
  }

  if (!email) {
    log.error({ userId: user.id, debugId }, "tryNotifySignup: user has no email, skipping")
    return
  }

  if (!confirmedAtRaw) {
    log.info({ userId: user.id, debugId }, "tryNotifySignup: no email_confirmed_at, skipping")
    return
  }

  const confirmedAtMs = new Date(confirmedAtRaw).getTime()
  const ageMs = Date.now() - confirmedAtMs
  const isFresh = ageMs >= 0 && ageMs < FRESH_CONFIRM_WINDOW_MS

  log.info(
    { userId: user.id, debugId, confirmedAtRaw, ageMs, isFresh },
    "tryNotifySignup freshness check",
  )

  if (!isFresh) return

  try {
    await notifyUserSignedUp({ userId: user.id, email })
  } catch (error) {
    log.error({ error, userId: user.id, debugId }, "tryNotifySignup: notifyUserSignedUp threw")
  }
}
