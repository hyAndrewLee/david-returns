import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

const ManageDashboardPage = async () => {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/manage/login")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let customers: any[] = []

  try {
    const adminClient = createAdminClient()

    console.log("[v0] Admin dashboard - Fetching data...")

    const { count: totalOrderCount, error: countError } = await adminClient
      .from("orders")
      .select("*", { count: "exact", head: true })

    console.log("[v0] Admin dashboard - Total orders in database:", totalOrderCount, "Error:", countError)

    const { data: allOrdersData, error: allOrdersError } = await adminClient
      .from("orders")
      .select("id, status, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(50)

    console.log("[v0] Admin dashboard - ALL orders (no filter):", {
      count: allOrdersData?.length || 0,
      statuses: allOrdersData?.map((o) => ({ id: o.id, status: o.status })) || [],
      error: allOrdersError,
    })

    const { data: customersData } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    customers = customersData || []
    console.log("[v0] Admin dashboard - Fetched customers:", customers.length)

    const { data: ordersData, error: ordersError } = await adminClient
      .from("orders")
      .select(
        "id, user_id, stripe_payment_intent_id, status, pickup_date::text, pickup_time, address, items, total_amount, is_instant, created_at, updated_at, tracking_status, picked_up_at, delivered_at, return_confirmed_at, proof_pickup_url, proof_delivery_url, proof_return_url, admin_notes, tracking_number",
      )
      .in("status", [
        "pending",
        "pending_payment",
        "scheduled",
        "picked_up",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
      ])
      .order("created_at", { ascending: false })

    console.log("[v0] Admin dashboard - Filtered orders query result:", {
      hasError: !!ordersError,
      error: ordersError,
      orderCount: ordersData?.length || 0,
      orderIds: ordersData?.map((o) => o.id) || [],
      statuses: ordersData?.map((o) => o.status) || [],
    })

    orders = (ordersData || []).map((order) => {
      const customerProfile = customers.find((c) => c.id === order.user_id)
      return {
        ...order,
        profiles: customerProfile || null,
      }
    })

    console.log("[v0] Admin dashboard - Final orders with profiles:", orders.length)
  } catch (error: unknown) {
    console.error("[v0] Error fetching admin dashboard data:", error)
  }

  return <AdminDashboard orders={orders} userEmail="Admin" customers={customers} />
}

export default ManageDashboardPage
