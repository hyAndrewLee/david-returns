import "server-only"

import { adminDb } from "@/server/db"
import { impersonationAudit, type ImpersonationAuditAction } from "@/server/db/schema"

export type RecordImpersonationAuditParams = {
  customerId: string
  adminIdentifier: string
  action: ImpersonationAuditAction
  ipAddress?: string | null
  userAgent?: string | null
}

export const recordImpersonationAudit = async (params: RecordImpersonationAuditParams): Promise<void> => {
  await adminDb.insert(impersonationAudit).values({
    customerId: params.customerId,
    adminIdentifier: params.adminIdentifier,
    action: params.action,
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
  })
}
