import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Order Details | David Returns Admin",
  description: "View and manage order details.",
}
import { AdminOrderDetailProvider } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"
import { OrderDetail } from "@/components/admin/OrderDetail"
import { adminDb } from "@/server/db"
import { orders as ordersTable, profiles as profilesTable } from "@/server/db/schema"
import { eq } from "drizzle-orm"

const OrderDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/manage/login")
  }

  const [order] = await adminDb
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1)

  if (!order) {
    notFound()
  }

  let userProfile = null
  if (order.userId) {
    const [profile] = await adminDb
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, order.userId))
      .limit(1)
    userProfile = profile ?? null
  }

  const orderWithProfile = {
    ...order,
    profiles: userProfile,
  }

  return (
    <AdminOrderDetailProvider initialOrder={orderWithProfile}>
      <OrderDetail />
    </AdminOrderDetailProvider>
  )
}

export default OrderDetailPage
