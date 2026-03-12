import { redirect, notFound } from "next/navigation"

import { createServerSupabaseClient } from "@/server/auth/supabase"
import { CustomerOrderDetail } from "@/components/customer/CustomerOrderDetail"
import { OrderDetailProvider } from "@/app/(customer)/orders/[id]/OrderDetailContext"
import { adminDb } from "@/server/db"
import { orders as ordersTable } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"

const CustomerOrderDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin")
  }

  const [order] = await adminDb
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, user.id)))
    .limit(1)

  if (!order) {
    notFound()
  }

  return (
    <OrderDetailProvider initialOrder={order}>
      <CustomerOrderDetail />
    </OrderDetailProvider>
  )
}

export default CustomerOrderDetailPage
