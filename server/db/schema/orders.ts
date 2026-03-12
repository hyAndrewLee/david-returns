import { pgTable, uuid, text, boolean, timestamp, integer, date, jsonb } from "drizzle-orm/pg-core"
import { pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authenticatedRole, authUsers, authUid, serviceRole } from "drizzle-orm/supabase"

export type OrderAddress = {
  fullName?: string
  phone?: string
  street?: string
  apt?: string | null
  buildingName?: string | null
  city?: string
  zip?: string
  notes?: string | null
  pickupInstructions?: string | null
}

export type OrderItem = {
  id?: string
  description?: string
  retailer?: string
  labelType?: string
  needsBox?: boolean
  returnTo?: string
  returnToOther?: string
  labelUrl?: string
  labelFileUrl?: string
  photoUrl?: string
  notes?: string
  hasLabel?: boolean
  hasBox?: boolean
  [key: string]: unknown
}

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    pickupDate: date("pickup_date").notNull(),
    pickupTime: text("pickup_time").notNull(),
    pickupMethod: text("pickup_method"),
    address: jsonb().$type<OrderAddress>().notNull(),
    items: jsonb().$type<OrderItem[]>().notNull(),
    plan: text(),
    isInstant: boolean("is_instant").default(false),
    totalAmount: integer("total_amount").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeSessionId: text("stripe_session_id"),
    status: text().notNull().default("scheduled"),
    trackingStatus: text("tracking_status").default("pending"),
    pickedUpAt: timestamp("picked_up_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    returnConfirmedAt: timestamp("return_confirmed_at", { withTimezone: true }),
    proofPickupUrl: text("proof_pickup_url"),
    proofDeliveryUrl: text("proof_delivery_url"),
    proofReturnUrl: text("proof_return_url"),
    adminNotes: text("admin_notes"),
    trackingNumber: text("tracking_number"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    pgPolicy("users can view own orders", {
      for: "select",
      to: authenticatedRole,
      using: sql`(select ${authUid}) = ${table.userId}`,
    }),
    pgPolicy("users can insert own orders", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`(select ${authUid}) = ${table.userId}`,
    }),
    pgPolicy("service role full access on orders", {
      for: "all",
      to: serviceRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
)

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
