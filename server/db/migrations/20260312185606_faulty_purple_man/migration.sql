CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"label" text DEFAULT 'Home',
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"street_address" text NOT NULL,
	"apt" text,
	"building_name" text,
	"city" text NOT NULL,
	"zip" text NOT NULL,
	"notes" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"pickup_date" date NOT NULL,
	"pickup_time" text NOT NULL,
	"pickup_method" text,
	"address" jsonb NOT NULL,
	"items" jsonb NOT NULL,
	"plan" text,
	"is_instant" boolean DEFAULT false,
	"total_amount" integer NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_session_id" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"tracking_status" text DEFAULT 'pending',
	"picked_up_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"return_confirmed_at" timestamp with time zone,
	"proof_pickup_url" text,
	"proof_delivery_url" text,
	"proof_return_url" text,
	"admin_notes" text,
	"tracking_number" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY,
	"full_name" text,
	"phone" text,
	"email" text,
	"is_admin" boolean DEFAULT false,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'inactive' NOT NULL,
	"plan" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
CREATE POLICY "users can view own addresses" ON "addresses" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select (select auth.uid())) = "addresses"."user_id");--> statement-breakpoint
CREATE POLICY "users can insert own addresses" ON "addresses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select (select auth.uid())) = "addresses"."user_id");--> statement-breakpoint
CREATE POLICY "users can update own addresses" ON "addresses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select (select auth.uid())) = "addresses"."user_id");--> statement-breakpoint
CREATE POLICY "users can delete own addresses" ON "addresses" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select (select auth.uid())) = "addresses"."user_id");--> statement-breakpoint
CREATE POLICY "service role full access on addresses" ON "addresses" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users can view own orders" ON "orders" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select (select auth.uid())) = "orders"."user_id");--> statement-breakpoint
CREATE POLICY "users can insert own orders" ON "orders" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select (select auth.uid())) = "orders"."user_id");--> statement-breakpoint
CREATE POLICY "service role full access on orders" ON "orders" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users can view own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select (select auth.uid())) = "profiles"."id");--> statement-breakpoint
CREATE POLICY "users can update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select (select auth.uid())) = "profiles"."id");--> statement-breakpoint
CREATE POLICY "service role full access on profiles" ON "profiles" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users can view own subscriptions" ON "subscriptions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select (select auth.uid())) = "subscriptions"."user_id");--> statement-breakpoint
CREATE POLICY "service role full access on subscriptions" ON "subscriptions" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);