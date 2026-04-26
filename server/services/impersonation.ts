import "server-only"

import { createAdminSupabaseClient, createServerSupabaseClient } from "@/server/auth/supabase"
import { findProfileBasicById, type ProfileBasicRow } from "@/server/repositories/profilesRepo"
import { recordImpersonationAudit } from "@/server/repositories/impersonationAuditRepo"
import { createLogger } from "@/lib/logger"

const log = createLogger("impersonation")

export type ImpersonationErrorCode = "CUSTOMER_NOT_FOUND" | "NO_EMAIL" | "LINK_FAILED" | "VERIFY_FAILED"

export class ImpersonationError extends Error {
  code: ImpersonationErrorCode
  constructor(code: ImpersonationErrorCode, message: string) {
    super(message)
    this.name = "ImpersonationError"
    this.code = code
  }
}

type StartImpersonationParams = {
  customerId: string
  adminIdentifier: string
  ipAddress?: string | null
  userAgent?: string | null
}

type StartImpersonationResult = {
  customerId: string
  redirectUrl: string
}

export const startImpersonation = async (
  params: StartImpersonationParams,
): Promise<StartImpersonationResult> => {
  const customer = await findProfileBasicById(params.customerId)
  if (!customer) {
    throw new ImpersonationError("CUSTOMER_NOT_FOUND", "Customer not found")
  }
  if (!customer.email) {
    throw new ImpersonationError("NO_EMAIL", "Customer has no email on file")
  }

  const adminClient = createAdminSupabaseClient()
  const { data: link, error: linkErr } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: customer.email,
  })
  if (linkErr || !link?.properties?.hashed_token) {
    log.error({ err: linkErr, customerId: params.customerId }, "generateLink failed")
    throw new ImpersonationError("LINK_FAILED", linkErr?.message ?? "Failed to generate magic link")
  }

  const ssrClient = await createServerSupabaseClient()
  const { error: verifyErr } = await ssrClient.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  })
  if (verifyErr) {
    log.error({ err: verifyErr, customerId: params.customerId }, "verifyOtp failed")
    throw new ImpersonationError("VERIFY_FAILED", verifyErr.message)
  }

  await recordImpersonationAudit({
    customerId: params.customerId,
    adminIdentifier: params.adminIdentifier,
    action: "start",
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
  })

  log.info(
    { customerId: params.customerId, admin: params.adminIdentifier },
    "impersonation started",
  )
  return { customerId: params.customerId, redirectUrl: "/dashboard" }
}

type StopImpersonationParams = {
  customerId: string | null
  adminIdentifier: string
  ipAddress?: string | null
  userAgent?: string | null
}

type StopImpersonationResult = { redirectUrl: string }

export const stopImpersonation = async (
  params: StopImpersonationParams,
): Promise<StopImpersonationResult> => {
  const ssrClient = await createServerSupabaseClient()
  await ssrClient.auth.signOut()

  if (params.customerId) {
    await recordImpersonationAudit({
      customerId: params.customerId,
      adminIdentifier: params.adminIdentifier,
      action: "stop",
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    })
  }

  log.info(
    { customerId: params.customerId, admin: params.adminIdentifier },
    "impersonation stopped",
  )
  return { redirectUrl: "/manage/dashboard" }
}

export const getImpersonatedCustomer = async (customerId: string): Promise<ProfileBasicRow | null> => {
  return findProfileBasicById(customerId)
}
