import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { CustomerOrders } from "@/components/CustomerOrders"
import { OrdersProvider } from "@/app/orders/OrdersContext"

const OrdersPage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <OrdersProvider initialOrders={orders || []} profile={profile} userEmail={user.email || ""}>
      <CustomerOrders />
    </OrdersProvider>
  )
}

export default OrdersPage
