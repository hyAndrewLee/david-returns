import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Admin Dashboard | David Returns",
  description: "Manage orders, customers, and operations for David Returns.",
}
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { AdminDashboardProvider } from "@/app/(admin)/manage/dashboard/AdminDashboardContext"
import { adminDb } from "@/server/db"
import { orders as ordersTable, profiles as profilesTable } from "@/server/db/schema"
import { desc, inArray } from "drizzle-orm"
import { ORDER_STATUSES } from "@/lib/constants"

const ManageDashboardPage = async () => {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/manage/login")
  }

  let orders: any[] = []
  let customers: any[] = []

  try {
    const allCustomers = await adminDb
      .select()
      .from(profilesTable)
      .orderBy(desc(profilesTable.createdAt))

    customers = allCustomers

    const allOrders = await adminDb
      .select()
      .from(ordersTable)
      .where(inArray(ordersTable.status, [...ORDER_STATUSES]))
      .orderBy(desc(ordersTable.createdAt))

    orders = allOrders.map((order) => {
      const customerProfile = customers.find((c: any) => c.id === order.userId)
      return {
        ...order,
        profiles: customerProfile || null,
      }
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
  }

  return (
    <AdminDashboardProvider orders={orders} userEmail="Admin" customers={customers}>
      <AdminDashboard />
    </AdminDashboardProvider>
  )
}

export default ManageDashboardPage
