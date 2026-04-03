import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../init';
import { adminProcedure } from '../middlewares';
import { adminDb } from '@/server/db';
import { profiles, addresses, subscriptions, orders } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createAdminSupabaseClient } from '@/server/auth/supabase';
import { cookies } from 'next/headers';

export const adminRouter = createTRPCRouter({
	login: publicProcedure.input(z.object({ username: z.string(), password: z.string() })).mutation(async ({ input }) => {
		const adminUsername = process.env.ADMIN_USERNAME || 'admin';
		const adminPassword = process.env.ADMIN_PASSWORD;

		if (!adminPassword) {
			return { success: false, error: 'Admin credentials not configured' };
		}

		if (input.username !== adminUsername || input.password !== adminPassword) {
			return { success: false, error: 'Invalid credentials' };
		}

		const cookieStore = await cookies();
		cookieStore.set('admin_session', 'authenticated', {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
		});

		return { success: true, redirectUrl: '/manage/dashboard' };
	}),

	logout: publicProcedure.mutation(async () => {
		const cookieStore = await cookies();
		cookieStore.delete('admin_session');
		return { success: true };
	}),

	listCustomers: adminProcedure.query(async () => {
		const allProfiles = await adminDb.select().from(profiles).orderBy(desc(profiles.createdAt));

		const allAddresses = await adminDb.select().from(addresses);
		const allSubscriptions = await adminDb.select().from(subscriptions);

		return allProfiles.map((profile) => ({
			...profile,
			addresses: allAddresses.filter((a) => a.userId === profile.id),
			subscriptions: allSubscriptions.filter((s) => s.userId === profile.id),
		}));
	}),

	deleteCustomer: adminProcedure.input(z.object({ customerId: z.string() })).mutation(async ({ input }) => {
		await adminDb.delete(addresses).where(eq(addresses.userId, input.customerId));
		await adminDb.delete(subscriptions).where(eq(subscriptions.userId, input.customerId));
		await adminDb.delete(orders).where(eq(orders.userId, input.customerId));
		await adminDb.delete(profiles).where(eq(profiles.id, input.customerId));

		const supabase = createAdminSupabaseClient();
		const { error: authError } = await supabase.auth.admin.deleteUser(input.customerId);

		if (authError) {
			return { success: false, error: authError.message };
		}

		return { success: true };
	}),
});
