import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerOrders } from "@/components/customer-orders"

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin")
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <CustomerOrders orders={orders || []} profile={profile} userEmail={user.email || ""} />
}
