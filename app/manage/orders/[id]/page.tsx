import { redirect, notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { OrderDetail } from "@/components/admin/order-detail"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/manage/login")
  }

  const adminClient = createAdminClient()
  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .select(
      "id, user_id, stripe_payment_intent_id, status, pickup_date::text, pickup_time, address, items, total_amount, is_instant, created_at, updated_at, tracking_status, picked_up_at, delivered_at, return_confirmed_at, proof_pickup_url, proof_delivery_url, proof_return_url, admin_notes, tracking_number",
    )
    .eq("id", id)
    .maybeSingle()

  if (orderError || !order) {
    notFound()
  }

  let userProfile = null
  if (order.user_id) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", order.user_id)
      .maybeSingle()

    userProfile = profile
  }

  const orderWithProfile = {
    ...order,
    profiles: userProfile,
  }

  return <OrderDetail order={orderWithProfile} />
}
