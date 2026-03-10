"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { deleteCustomer } from "@/app/actions/admin"
import { deleteOrder, updateOrderStatus, bulkDeleteOrders } from "@/app/manage/actions"

export type Order = {
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
    pickupInstructions?: string
  }
  items: Array<{
    retailer: string
    description?: string
    hasLabel: boolean
    hasBox: boolean
    labelFileUrl?: string
    photoUrl?: string
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

export type Profile = {
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

export type AdminDashboardProps = {
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

export type AdminStats = {
  total: number
  pending: number
  inProgress: number
  completed: number
  customers: number
  todaysPickups: number
}

export const statusColors: Record<string, string> = {
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

export const statusLabels: Record<string, string> = {
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

type AdminDashboardContextValue = {
  orders: Order[]
  customers: Profile[]
  filteredOrders: Order[]
  filteredCustomers: Profile[]
  todaysPickups: Order[]
  stats: AdminStats
  userEmail: string
  debugInfo?: AdminDashboardProps["debugInfo"]

  searchQuery: string
  setSearchQuery: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  customerSearchTerm: string
  setCustomerSearchTerm: (value: string) => void
  activeTab: string
  setActiveTab: (value: string) => void

  selectedOrderIds: Set<string>
  isRefreshing: boolean
  deletingCustomerId: string | null
  deletingOrderId: string | null
  updatingOrderId: string | null
  isBulkDeleting: boolean

  handleRefresh: () => void
  handleSignOut: () => Promise<void>
  handleDeleteOrder: (orderId: string) => Promise<void>
  handleDeleteCustomer: (customerId: string) => Promise<void>
  handleBulkDelete: () => Promise<void>
  handleQuickStatusUpdate: (orderId: string, newStatus: string) => Promise<void>
  toggleOrderSelection: (orderId: string) => void
  toggleAllOrders: () => void
  clearSelection: () => void
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null)

export const useAdminDashboard = () => {
  const ctx = useContext(AdminDashboardContext)
  if (!ctx) throw new Error("useAdminDashboard must be used within AdminDashboardProvider")
  return ctx
}

export const AdminDashboardProvider = ({
  children,
  orders,
  userEmail,
  customers = [],
  debugInfo,
}: AdminDashboardProps & { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("")
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

  useEffect(() => {
    const supabase = createClient()

    const ordersChannel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        router.refresh()
      })
      .subscribe()

    const customersChannel = supabase
      .channel("admin-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        router.refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(customersChannel)
    }
  }, [router])

  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/manage/login")
    router.refresh()
  }, [router])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [router])

  const handleQuickStatusUpdate = useCallback(
    async (orderId: string, newStatus: string) => {
      setUpdatingOrderId(orderId)
      try {
        await updateOrderStatus(orderId, { tracking_status: newStatus })
        router.refresh()
      } catch (error) {
        alert(`Failed to update status: ${error}`)
      } finally {
        setUpdatingOrderId(null)
      }
    },
    [router],
  )

  const handleDeleteOrder = useCallback(
    async (orderId: string) => {
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
    },
    [router],
  )

  const handleDeleteCustomer = useCallback(
    async (customerId: string) => {
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
    },
    [router],
  )

  const handleBulkDelete = useCallback(async () => {
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
  }, [selectedOrderIds, router])

  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedOrderIds(new Set())
  }, [])

  const todaysPickups = useMemo(() => {
    const todayET = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" })
    return orders
      .filter((order) => {
        if (!order.pickup_date) return false
        const pickupDate = order.pickup_date.split("T")[0]
        return pickupDate === todayET && order.tracking_status !== "completed" && order.tracking_status !== "cancelled"
      })
      .sort((a, b) => {
        const timeOrder = ["8-11am", "11am-2pm", "2-5pm", "5-8pm"]
        return timeOrder.indexOf(a.pickup_time) - timeOrder.indexOf(b.pickup_time)
      })
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        order.profiles?.full_name?.toLowerCase().includes(query) ||
        order.profiles?.email?.toLowerCase().includes(query) ||
        order.address?.city?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)

      const matchesStatus = statusFilter === "all" || order.tracking_status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      return (
        customer.full_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.phone?.includes(customerSearchTerm)
      )
    })
  }, [customers, customerSearchTerm])

  const toggleAllOrders = useCallback(() => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set())
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map((o) => o.id)))
    }
  }, [selectedOrderIds.size, filteredOrders])

  const stats = useMemo<AdminStats>(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.tracking_status === "pending").length,
      inProgress: orders.filter((o) => o.tracking_status === "in_progress").length,
      completed: orders.filter((o) => o.tracking_status === "completed").length,
      customers: customers.length,
      todaysPickups: todaysPickups.length,
    }),
    [orders, customers.length, todaysPickups.length],
  )

  const value = useMemo<AdminDashboardContextValue>(
    () => ({
      orders,
      customers,
      filteredOrders,
      filteredCustomers,
      todaysPickups,
      stats,
      userEmail,
      debugInfo,
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      customerSearchTerm,
      setCustomerSearchTerm,
      activeTab,
      setActiveTab,
      selectedOrderIds,
      isRefreshing,
      deletingCustomerId,
      deletingOrderId,
      updatingOrderId,
      isBulkDeleting,
      handleRefresh,
      handleSignOut,
      handleDeleteOrder,
      handleDeleteCustomer,
      handleBulkDelete,
      handleQuickStatusUpdate,
      toggleOrderSelection,
      toggleAllOrders,
      clearSelection,
    }),
    [
      orders,
      customers,
      filteredOrders,
      filteredCustomers,
      todaysPickups,
      stats,
      userEmail,
      debugInfo,
      searchQuery,
      statusFilter,
      customerSearchTerm,
      activeTab,
      selectedOrderIds,
      isRefreshing,
      deletingCustomerId,
      deletingOrderId,
      updatingOrderId,
      isBulkDeleting,
      handleRefresh,
      handleSignOut,
      handleDeleteOrder,
      handleDeleteCustomer,
      handleBulkDelete,
      handleQuickStatusUpdate,
      toggleOrderSelection,
      toggleAllOrders,
      clearSelection,
    ],
  )

  return <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>
}
