import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerOrderDetail } from "@/components/customer-order-detail"

const CustomerOrderDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin")
  }

  // CRITICAL: Cast pickup_date to text (pickup_date::text) to prevent timezone conversion issues.
  // DO NOT remove the ::text cast - it ensures dates display correctly in ET.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, user_id, stripe_payment_intent_id, status, pickup_date::text, pickup_time, address, items, total_amount, is_instant, created_at, updated_at, tracking_status, picked_up_at, delivered_at, return_confirmed_at, proof_pickup_url, proof_delivery_url, proof_return_url, admin_notes, tracking_number",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (orderError || !order) {
    notFound()
  }

  return <CustomerOrderDetail order={order} />
}

export default CustomerOrderDetailPage
