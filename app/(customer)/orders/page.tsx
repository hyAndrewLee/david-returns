import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { createServerSupabaseClient } from "@/server/auth/supabase"
import { CustomerOrders } from "@/components/customer/CustomerOrders"
import { OrdersProvider } from "@/app/(customer)/orders/OrdersContext"
import { adminDb } from "@/server/db"
import { orders as ordersTable, profiles as profilesTable } from "@/server/db/schema"
import { eq, desc } from "drizzle-orm"

export const metadata: Metadata = {
  title: "My Orders | David Returns",
  description: "View and track all your return pickup orders.",
}

const OrdersPage = async () => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin")
  }

  const orders = await adminDb
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, user.id))
    .orderBy(desc(ordersTable.createdAt))

  const [profile] = await adminDb
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, user.id))
    .limit(1)

  return (
    <OrdersProvider initialOrders={orders} profile={profile ?? null} userEmail={user.email || ""}>
      <CustomerOrders />
    </OrdersProvider>
  )
}

export default OrdersPage
