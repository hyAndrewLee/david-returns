import { pgTable, uuid, text, boolean, timestamp, integer, date, jsonb } from 'drizzle-orm/pg-core';
import { pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { authenticatedRole, authUsers, authUid, serviceRole } from 'drizzle-orm/supabase';
import type { OrderStatus } from '@/lib/constants';

export type OrderAddress = {
	fullName?: string;
	phone?: string;
	street?: string;
	apt?: string | null;
	buildingName?: string | null;
	city?: string;
	zip?: string;
	notes?: string | null;
	pickupInstructions?: string | null;
};

export type OrderItem = {
	id?: string;
	description?: string;
	retailer?: string;
	labelType?: string;
	needsBox?: boolean;
	returnTo?: string;
	returnToOther?: string;
	labelUrl?: string;
	labelFileUrl?: string;
	photoUrl?: string;
	notes?: string;
	hasLabel?: boolean;
	hasBox?: boolean;
	[key: string]: unknown;
};

export const orders = pgTable(
	'orders',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => authUsers.id, { onDelete: 'cascade' }),
		pickupDate: date('pickup_date').notNull(),
		pickupTime: text('pickup_time').notNull(),
		pickupMethod: text('pickup_method'),
		address: jsonb().$type<OrderAddress>().notNull(),
		items: jsonb().$type<OrderItem[]>().notNull(),
		plan: text(),
		isInstant: boolean('is_instant').default(false),
		totalAmount: integer('total_amount').notNull(),
		stripePaymentIntentId: text('stripe_payment_intent_id'),
		stripeSessionId: text('stripe_session_id'),
		status: text().$type<OrderStatus>().notNull().default('scheduled'),
		adminNotes: text('admin_notes'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
	},
	(table) => [
		pgPolicy('users can view own orders', {
			for: 'select',
			to: authenticatedRole,
			using: sql`(select ${authUid}) = ${table.userId}`,
		}),
		pgPolicy('users can insert own orders', {
			for: 'insert',
			to: authenticatedRole,
			withCheck: sql`(select ${authUid}) = ${table.userId}`,
		}),
		pgPolicy('service role full access on orders', {
			for: 'all',
			to: serviceRole,
			using: sql`true`,
			withCheck: sql`true`,
		}),
	]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
