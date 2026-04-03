import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { createServerSupabaseClient } from "@/server/auth/supabase"

export const metadata: Metadata = {
  title: "Dashboard | David Returns",
  description: "View and manage your return pickups, track order status, and schedule new pickups.",
}
import { createCaller } from "@/server/trpc/router"
import { createTRPCContext } from "@/server/trpc/init"
import { UserDashboard } from "@/components/customer/UserDashboard"
import { DashboardProvider } from "@/app/(customer)/dashboard/DashboardContext"
import { adminDb } from "@/server/db"
import { orders as ordersTable, profiles as profilesTable, subscriptions as subscriptionsTable } from "@/server/db/schema"
import { eq, desc, and } from "drizzle-orm"

const DashboardPage = async () => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin")
  }

  const [orders, [profile], [subscription]] = await Promise.all([
    adminDb
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, user.id))
      .orderBy(desc(ordersTable.createdAt)),
    adminDb
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, user.id))
      .limit(1),
    adminDb
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, user.id),
          eq(subscriptionsTable.status, "active"),
          eq(subscriptionsTable.plan, "membership"),
        ),
      )
      .limit(1),
  ])

  const activeOrders = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.trackingStatus || "pending"),
  )
  const pastOrders = orders.filter((order) =>
    ["completed", "cancelled"].includes(order.trackingStatus || ""),
  )

  return (
    <DashboardProvider
      activeOrders={activeOrders}
      pastOrders={pastOrders}
      profile={profile ?? null}
      userEmail={user.email || ""}
      subscription={subscription ?? null}
    >
      <UserDashboard />
    </DashboardProvider>
  )
}

export default DashboardPage
