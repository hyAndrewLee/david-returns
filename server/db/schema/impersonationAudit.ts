import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core"
import { pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { serviceRole } from "drizzle-orm/supabase"

export type ImpersonationAuditAction = "start" | "stop"

export const impersonationAudit = pgTable(
  "impersonation_audit",
  {
    id: uuid().primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull(),
    adminIdentifier: text("admin_identifier").notNull(),
    action: text().$type<ImpersonationAuditAction>().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("impersonation_audit_customer_id_idx").on(table.customerId),
    index("impersonation_audit_created_at_idx").on(table.createdAt),
    pgPolicy("service role full access on impersonation_audit", {
      for: "all",
      to: serviceRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
)

export type ImpersonationAudit = typeof impersonationAudit.$inferSelect
export type NewImpersonationAudit = typeof impersonationAudit.$inferInsert
