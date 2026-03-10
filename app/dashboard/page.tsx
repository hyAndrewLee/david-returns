import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserDashboard } from "@/components/user-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin")
  }

  // CRITICAL: Cast pickup_date to text (pickup_date::text) to prevent timezone conversion issues.
  // This ensures dates stored as "2025-12-17" are retrieved exactly as "2025-12-17" without
  // PostgreSQL applying timezone shifts. DO NOT remove the ::text cast.
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, user_id, stripe_payment_intent_id, status, pickup_date::text, pickup_time, address, items, total_amount, is_instant, created_at, updated_at, tracking_status, picked_up_at, delivered_at, return_confirmed_at, proof_pickup_url, proof_delivery_url, proof_return_url, admin_notes, tracking_number",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, current_period_end")
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("plan", "membership")
    .maybeSingle()

  // Separate active and completed orders
  const activeOrders = (orders || []).filter(
    (order) => !["completed", "cancelled"].includes(order.tracking_status || "pending"),
  )
  const pastOrders = (orders || []).filter((order) => ["completed", "cancelled"].includes(order.tracking_status || ""))

  return (
    <UserDashboard
      activeOrders={activeOrders}
      pastOrders={pastOrders}
      profile={profile}
      userEmail={user.email || ""}
      subscription={subscription}
    />
  )
}
