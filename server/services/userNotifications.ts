import "server-only"

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
 * Called from /auth/confirm after successful verifyOtp. OTP is single-use,
 * so Supabase enforces idempotency — second clicks never reach here.
 * Each notifier is wrapped in its own try/catch — one failure never blocks others.
 */
export const notifyUserSignedUp = async ({
  userId,
  email,
}: NotifyUserSignedUpProps): Promise<void> => {
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

  const customerName = profile?.fullName ?? "there"

  try {
    await sendWelcomeEmail({ customerEmail: email, customerName })
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
