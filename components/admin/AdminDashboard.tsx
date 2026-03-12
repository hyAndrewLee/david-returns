"use client"

import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Package, LogOut, RefreshCw, Users, Calendar } from "lucide-react"
import { useAdminDashboard } from "@/app/(admin)/manage/dashboard/AdminDashboardContext"
import { AdminStatsCards } from "@/components/admin/AdminStatsCards"
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab"
import { AdminCustomersTab } from "@/components/admin/AdminCustomersTab"
import { AdminTodaysPickups } from "@/components/admin/AdminTodaysPickups"

export const AdminDashboard = () => {
  const { userEmail, todaysPickups, activeTab, setActiveTab, isRefreshing, handleRefresh, handleSignOut } =
    useAdminDashboard()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">David Returns Admin</h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <AdminStatsCards />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="today" className="gap-2">
              <Calendar className="h-4 w-4" />
              Today&apos;s Pickups
              {todaysPickups.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {todaysPickups.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              All Orders
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <AdminTodaysPickups />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersTab />
          </TabsContent>

          <TabsContent value="customers">
            <AdminCustomersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
