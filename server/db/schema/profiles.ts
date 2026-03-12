import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authenticatedRole, authUsers, authUid, serviceRole } from "drizzle-orm/supabase"

export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: text("full_name"),
    phone: text(),
    email: text(),
    isAdmin: boolean("is_admin").default(false),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    pgPolicy("users can view own profile", {
      for: "select",
      to: authenticatedRole,
      using: sql`(select ${authUid}) = ${table.id}`,
    }),
    pgPolicy("users can update own profile", {
      for: "update",
      to: authenticatedRole,
      using: sql`(select ${authUid}) = ${table.id}`,
    }),
    pgPolicy("service role full access on profiles", {
      for: "all",
      to: serviceRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
)

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
