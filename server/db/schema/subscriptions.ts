import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authenticatedRole, authUsers, authUid, serviceRole } from "drizzle-orm/supabase"

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    status: text().notNull().default("inactive"),
    plan: text(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    pgPolicy("users can view own subscriptions", {
      for: "select",
      to: authenticatedRole,
      using: sql`(select ${authUid}) = ${table.userId}`,
    }),
    pgPolicy("service role full access on subscriptions", {
      for: "all",
      to: serviceRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
)

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
