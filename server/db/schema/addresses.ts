import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authenticatedRole, authUsers, authUid, serviceRole } from "drizzle-orm/supabase"

export const addresses = pgTable(
  "addresses",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    label: text().default("Home"),
    fullName: text("full_name").notNull(),
    phone: text().notNull(),
    streetAddress: text("street_address").notNull(),
    apt: text(),
    buildingName: text("building_name"),
    city: text().notNull(),
    zip: text().notNull(),
    notes: text(),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    pgPolicy("users can view own addresses", {
      for: "select",
      to: authenticatedRole,
      using: sql`(select ${authUid}) = ${table.userId}`,
    }),
    pgPolicy("users can insert own addresses", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`(select ${authUid}) = ${table.userId}`,
    }),
    pgPolicy("users can update own addresses", {
      for: "update",
      to: authenticatedRole,
      using: sql`(select ${authUid}) = ${table.userId}`,
    }),
    pgPolicy("users can delete own addresses", {
      for: "delete",
      to: authenticatedRole,
      using: sql`(select ${authUid}) = ${table.userId}`,
    }),
    pgPolicy("service role full access on addresses", {
      for: "all",
      to: serviceRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
)

export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
