"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Package,
  LogOut,
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Eye,
  Users,
  AlertTriangle,
  Trash2,
  Calendar,
  Check,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { deleteCustomer } from "@/app/actions/admin"
import { deleteOrder, updateOrderStatus, bulkDeleteOrders } from "@/app/manage/actions"
import { formatDateShort } from "@/lib/timezone"
import { Checkbox } from "@/components/ui/checkbox"

type Order = {
  id: string
  created_at: string
  pickup_date: string
  pickup_time: string
  address: {
    street: string
    apt?: string
    city: string
    zip: string
    notes?: string
    pickupInstructions?: string // Added pickupInstructions field
  }
  items: Array<{
    retailer: string
    description?: string
    hasLabel: boolean
    hasBox: boolean
    labelFileUrl?: string // Added labelFileUrl field
    photoUrl?: string // Added photoUrl field
  }>
  is_instant: boolean
  status: string
  tracking_status: string
  total_amount: number
  profiles?: {
    full_name: string
    email: string
    phone: string
  }
}

type Profile = {
  id: string
  full_name: string
  email: string
  phone: string
  created_at: string
  addresses?: Array<{
    street_address: string
    apt?: string
    city: string
    zip: string
    is_default: boolean
  }>
  subscriptions?: Array<{
    status: string
    plan: string | null
  }>
}

type AdminDashboardProps = {
  orders: Order[]
  userEmail: string
  customers?: Profile[]
  debugInfo?: {
    error?: string
    ordersError?: string
    customersError?: string
    customersCount?: number
  }
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  picked_up: "bg-green-500/10 text-green-500 border-green-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_transit: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  return_confirmed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  picked_up: "Picked Up",
  scheduled: "Scheduled",
  in_transit: "In Transit",
  return_confirmed: "Return Confirmed",
  delivered: "Delivered",
}

export function AdminDashboard({ orders, userEmail, customers = [], debugInfo }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("orders")
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const router = useRouter()

  // Using a single search term state for both order and customer search
  const [searchQuery, setSearchQuery] = useState("") // Renamed from searchTerm for clarity

  useEffect(() => {
    const supabase = createClient()

    const ordersChannel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          router.refresh()
        },
      )
      .subscribe()

    const customersChannel = supabase
      .channel("admin-customers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(customersChannel)
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/manage/login")
    router.refresh()
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      await updateOrderStatus(orderId, { tracking_status: newStatus })
      router.refresh()
    } catch (error) {
      alert(`Failed to update status: ${error}`)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getTodaysPickups = () => {
    // Using new Date().toLocaleDateString for timezone
    const todayET = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" })
    const filtered = orders
      .filter((order) => {
        if (!order.pickup_date) return false
        const pickupDate = order.pickup_date.split("T")[0]
        return pickupDate === todayET && order.tracking_status !== "completed" && order.tracking_status !== "cancelled"
      })
      .sort((a, b) => {
        const timeOrder = ["8-11am", "11am-2pm", "2-5pm", "5-8pm"]
        return timeOrder.indexOf(a.pickup_time) - timeOrder.indexOf(b.pickup_time)
      })

    return filtered
  }

  const todaysPickups = getTodaysPickups()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.profiles?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) || // Changed to searchQuery
      order.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || // Changed to searchQuery
      order.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) || // Changed to searchQuery
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) // Changed to searchQuery

    const matchesStatus = statusFilter === "all" || order.tracking_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.full_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone?.includes(customerSearchTerm)
    )
  })

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.tracking_status === "pending").length,
    inProgress: orders.filter((o) => o.tracking_status === "in_progress").length,
    completed: orders.filter((o) => o.tracking_status === "completed").length,
    customers: customers.length,
    todaysPickups: todaysPickups.length,
  }

  const handleDeleteCustomer = async (customerId: string) => {
    setDeletingCustomerId(customerId)
    try {
      const result = await deleteCustomer(customerId)
      if (result.success) {
        router.refresh()
      } else {
        alert(`Failed to delete customer: ${result.error}`)
      }
    } catch (error) {
      alert(`Failed to delete customer: ${error}`)
    } finally {
      setDeletingCustomerId(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId)
    try {
      const result = await deleteOrder(orderId)
      if (result.success) {
        router.refresh()
      } else {
        alert(`Failed to delete order: ${result.error}`)
      }
    } catch (error) {
      alert(`Failed to delete order: ${error}`)
    } finally {
      setDeletingOrderId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedOrderIds.size === 0) return

    setIsBulkDeleting(true)
    try {
      const result = await bulkDeleteOrders(Array.from(selectedOrderIds))
      if (result.success) {
        setSelectedOrderIds(new Set())
        router.refresh()
      } else {
        alert(`Failed to delete orders: ${result.error}`)
      }
    } catch (error) {
      alert(`Failed to delete orders: ${error}`)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrderIds)
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId)
    } else {
      newSelection.add(orderId)
    }
    setSelectedOrderIds(newSelection)
  }

  const toggleAllOrders = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set())
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map((o) => o.id)))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {debugInfo && (debugInfo.error || debugInfo.ordersError || debugInfo.customersError) && (
        <div className="bg-red-100 border-b border-red-200 px-4 py-3">
          <div className="mx-auto max-w-7xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="text-sm text-red-800">
              <strong>Debug Info:</strong> {debugInfo.error || debugInfo.ordersError || debugInfo.customersError}
              {debugInfo.customersCount !== undefined && ` | Customers fetched: ${debugInfo.customersCount}`}
            </div>
          </div>
        </div>
      )}

      {debugInfo && !debugInfo.error && !debugInfo.customersError && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-3">
          <div className="mx-auto max-w-7xl flex items-center gap-2">
            <div className="text-sm text-blue-800">
              <strong>Debug:</strong> Customers fetched: {debugInfo.customersCount ?? 0} | Customers prop length:{" "}
              {customers.length}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">Today's Pickups</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.todaysPickups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Orders and Customers */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="today" className="gap-2">
              <Calendar className="h-4 w-4" />
              Today's Pickups
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
            {todaysPickups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pickups scheduled for today</h3>
                  <p className="text-sm text-muted-foreground">Check back tomorrow or view all orders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {["8-11am", "11am-2pm", "2-5pm", "5-8pm"].map((timeWindow) => {
                  const pickupsInWindow = todaysPickups.filter((order) => order.pickup_time === timeWindow)
                  if (pickupsInWindow.length === 0) return null

                  return (
                    <div key={timeWindow}>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{timeWindow}</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {pickupsInWindow.length} pickup{pickupsInWindow.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <Card>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Quick Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pickupsInWindow.map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell>
                                    <div className="font-medium">#{order.id.slice(0, 8)}</div>
                                    {order.is_instant && (
                                      <Badge
                                        variant="outline"
                                        className="mt-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium"
                                      >
                                        Instant
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{order.profiles?.full_name || "N/A"}</div>
                                    <div className="text-xs text-muted-foreground">{order.profiles?.phone}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-start gap-1">
                                      <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
                                      <div>
                                        <div className="text-sm font-medium">{order.address?.street}</div>
                                        {order.address?.apt && (
                                          <div className="text-xs text-muted-foreground">Apt {order.address.apt}</div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                          {order.address?.city}, {order.address?.zip}
                                        </div>
                                        {order.address?.pickupInstructions && (
                                          <div className="text-xs text-muted-foreground">
                                            Instructions: {order.address.pickupInstructions}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">{order.items?.length || 0} item(s)</div>
                                    <div className="text-xs text-muted-foreground">
                                      {order.items?.[0]?.retailer}
                                      {order.items?.length > 1 && ` +${order.items.length - 1}`}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={statusColors[order.tracking_status || "pending"]}
                                    >
                                      {statusLabels[order.tracking_status || "pending"]}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                      {order.tracking_status === "pending" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleQuickStatusUpdate(order.id, "in_progress")}
                                          disabled={updatingOrderId === order.id}
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                          <Truck className="mr-1.5 h-3.5 w-3.5" />
                                          Start Pickup
                                        </Button>
                                      )}
                                      {order.tracking_status === "in_progress" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleQuickStatusUpdate(order.id, "picked_up")}
                                          disabled={updatingOrderId === order.id}
                                          className="text-green-600 border-green-200 hover:bg-green-50"
                                        >
                                          <Check className="mr-1.5 h-3.5 w-3.5" />
                                          Mark Picked Up
                                        </Button>
                                      )}
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/manage/orders/${order.id}`}>
                                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                                          View
                                        </Link>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}

                {(() => {
                  const assignedPickups = todaysPickups.filter((order) =>
                    ["8-11am", "11am-2pm", "2-5pm", "5-8pm"].includes(order.pickup_time),
                  )
                  const unassignedPickups = todaysPickups.filter(
                    (order) => !["8-11am", "11am-2pm", "2-5pm", "5-8pm"].includes(order.pickup_time),
                  )

                  if (unassignedPickups.length === 0) return null

                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Other Times</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {unassignedPickups.length} pickup{unassignedPickups.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <Card>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Quick Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {unassignedPickups.map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell>
                                    <div className="font-medium">#{order.id.slice(0, 8)}</div>
                                    {order.is_instant && (
                                      <Badge
                                        variant="outline"
                                        className="mt-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium"
                                      >
                                        Instant
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{order.profiles?.full_name || "N/A"}</div>
                                    <div className="text-xs text-muted-foreground">{order.profiles?.phone}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm font-medium">{order.pickup_time || "Not set"}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-start gap-1">
                                      <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
                                      <div>
                                        <div className="text-sm font-medium">{order.address?.street}</div>
                                        {order.address?.apt && (
                                          <div className="text-xs text-muted-foreground">Apt {order.address.apt}</div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                          {order.address?.city}, {order.address?.zip}
                                        </div>
                                        {order.address?.pickupInstructions && (
                                          <div className="text-xs text-muted-foreground">
                                            Instructions: {order.address.pickupInstructions}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">{order.items?.length || 0} item(s)</div>
                                    <div className="text-xs text-muted-foreground">
                                      {order.items?.[0]?.retailer}
                                      {order.items?.length > 1 && ` +${order.items.length - 1}`}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={statusColors[order.tracking_status || "pending"]}
                                    >
                                      {statusLabels[order.tracking_status || "pending"]}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                      {order.tracking_status === "pending" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleQuickStatusUpdate(order.id, "in_progress")}
                                          disabled={updatingOrderId === order.id}
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                          <Truck className="mr-1.5 h-3.5 w-3.5" />
                                          Start Pickup
                                        </Button>
                                      )}
                                      {order.tracking_status === "in_progress" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleQuickStatusUpdate(order.id, "picked_up")}
                                          disabled={updatingOrderId === order.id}
                                          className="text-green-600 border-green-200 hover:bg-green-50"
                                        >
                                          <Check className="mr-1.5 h-3.5 w-3.5" />
                                          Mark Picked Up
                                        </Button>
                                      )}
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/manage/orders/${order.id}`}>
                                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                                          View
                                        </Link>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })()}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Search by order ID, tracking, or email..."
                    className="pl-10"
                    value={searchQuery} // Using searchQuery for the search input
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="return_confirmed">Return Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedOrderIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete {selectedOrderIds.size} {selectedOrderIds.size === 1 ? "Order" : "Orders"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedOrderIds.size} Orders?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedOrderIds.size}
                        {selectedOrderIds.size === 1 ? " order" : " orders"}? This action cannot be undone and will
                        permanently remove all order data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600">
                        {isBulkDeleting ? "Deleting..." : "Delete Orders"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                          onCheckedChange={toggleAllOrders}
                        />
                      </TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => {
                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedOrderIds.has(order.id)}
                                onCheckedChange={() => toggleOrderSelection(order.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{order.profiles?.full_name || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.profiles?.phone || order.profiles?.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.pickup_date ? formatDateShort(order.pickup_date.split("T")[0]) : "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">{order.pickup_time}</div>
                              {order.is_instant && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium"
                                >
                                  Instant
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[order.tracking_status || "pending"]}>
                                {statusLabels[order.tracking_status || "pending"]}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">${order.total_amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {order.tracking_status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleQuickStatusUpdate(order.id, "in_progress")}
                                    disabled={updatingOrderId === order.id}
                                    className="text-blue-600 hover:bg-blue-50"
                                  >
                                    <Truck className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {order.tracking_status === "in_progress" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleQuickStatusUpdate(order.id, "picked_up")}
                                    disabled={updatingOrderId === order.id}
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/manage/orders/${order.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </Link>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                      disabled={deletingOrderId === order.id}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete order #{order.id.slice(0, 8)}? This action
                                        cannot be undone and will permanently remove all order data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        {deletingOrderId === order.id ? "Deleting..." : "Delete Order"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const defaultAddress = customer.addresses?.find((a) => a.is_default) || customer.addresses?.[0]
                        const subscription = customer.subscriptions?.[0]
                        const isMember = subscription?.status === "active"
                        return (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="font-medium">{customer.full_name || "N/A"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{customer.email || "N/A"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{customer.phone || "N/A"}</div>
                            </TableCell>
                            <TableCell>
                              {defaultAddress ? (
                                <div className="flex items-start gap-1">
                                  <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <div className="text-sm">{defaultAddress.street_address}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {defaultAddress.city}, {defaultAddress.zip}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">No address</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isMember ? (
                                <Badge className="bg-primary/10 text-primary border-primary/20">Member</Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{format(new Date(customer.created_at), "MMM d, yyyy")}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    disabled={deletingCustomerId === customer.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <strong>{customer.full_name || customer.email}</strong>? This will permanently
                                      remove their account, all orders, addresses, and subscription data. This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCustomer(customer.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      {deletingCustomerId === customer.id ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
