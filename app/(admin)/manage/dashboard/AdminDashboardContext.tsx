"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { trpc } from "@/lib/trpc"
import { STATUS_COLORS, STATUS_LABELS, type OrderStatus } from "@/lib/constants"
import type { OrderAddress, OrderItem } from "@/server/db/schema/orders"

export type Order = {
  id: string
  createdAt: Date | null
  pickupDate: string
  pickupTime: string
  address: OrderAddress | null
  items: OrderItem[]
  isInstant: boolean | null
  status: OrderStatus
  totalAmount: number
  userId: string
  profiles?: {
    fullName: string | null
    email: string | null
    phone: string | null
  } | null
}

export type Profile = {
  id: string
  fullName: string | null
  email: string | null
  phone: string | null
  createdAt: Date | null
  addresses?: any[]
  subscriptions?: any[]
}

const EMPTY_CUSTOMERS: Profile[] = []

export type AdminStats = {
  total: number
  pending: number
  inProgress: number
  completed: number
  customers: number
  todaysPickups: number
}

export { STATUS_COLORS as statusColors, STATUS_LABELS as statusLabels }

type AdminDashboardContextValue = {
  orders: Order[]
  customers: Profile[]
  filteredOrders: Order[]
  filteredCustomers: Profile[]
  todaysPickups: Order[]
  stats: AdminStats
  userEmail: string

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
  isBulkDeleting: boolean

  handleRefresh: () => void
  handleSignOut: () => Promise<void>
  handleDeleteOrder: (orderId: string) => Promise<void>
  handleDeleteCustomer: (customerId: string) => Promise<void>
  handleBulkDelete: () => Promise<void>
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

type AdminDashboardProviderProps = {
  children: React.ReactNode
  orders: Order[]
  userEmail: string
  customers?: Profile[]
}

export const AdminDashboardProvider = ({
  children,
  orders,
  userEmail,
  customers = EMPTY_CUSTOMERS,
}: AdminDashboardProviderProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("orders")
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const router = useRouter()

  const deleteOrderMutation = trpc.orders.delete.useMutation()
  const bulkDeleteMutation = trpc.orders.bulkDelete.useMutation()
  const deleteCustomerMutation = trpc.admin.deleteCustomer.useMutation()

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

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
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push("/manage/login")
    router.refresh()
  }, [router])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [router])

  const handleDeleteOrder = useCallback(
    async (orderId: string) => {
      setDeletingOrderId(orderId)
      try {
        await deleteOrderMutation.mutateAsync({ orderId })
        router.refresh()
      } catch (error) {
        alert(`Failed to delete order: ${error}`)
      } finally {
        setDeletingOrderId(null)
      }
    },
    [deleteOrderMutation, router],
  )

  const handleDeleteCustomer = useCallback(
    async (customerId: string) => {
      setDeletingCustomerId(customerId)
      try {
        const result = await deleteCustomerMutation.mutateAsync({ customerId })
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
    [deleteCustomerMutation, router],
  )

  const handleBulkDelete = useCallback(async () => {
    if (selectedOrderIds.size === 0) return

    setIsBulkDeleting(true)
    try {
      await bulkDeleteMutation.mutateAsync({ orderIds: Array.from(selectedOrderIds) })
      setSelectedOrderIds(new Set())
      router.refresh()
    } catch (error) {
      alert(`Failed to delete orders: ${error}`)
    } finally {
      setIsBulkDeleting(false)
    }
  }, [selectedOrderIds, bulkDeleteMutation, router])

  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
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
        if (!order.pickupDate) return false
        const pickupDate = String(order.pickupDate).split("T")[0]
        return pickupDate === todayET && order.status !== "completed" && order.status !== "cancelled"
      })
      .sort((a, b) => {
        const timeOrder = ["8-11am", "11am-2pm", "2-5pm", "5-8pm"]
        return timeOrder.indexOf(a.pickupTime) - timeOrder.indexOf(b.pickupTime)
      })
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        order.profiles?.fullName?.toLowerCase().includes(query) ||
        order.profiles?.email?.toLowerCase().includes(query) ||
        order.address?.city?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)

      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      return (
        customer.fullName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
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
      pending: orders.filter((o) => o.status === "scheduled").length,
      inProgress: orders.filter((o) =>
        o.status === "picked_up" || o.status === "sent_to_carrier" || o.status === "in_transit",
      ).length,
      completed: orders.filter((o) => o.status === "completed").length,
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
      isBulkDeleting,
      handleRefresh,
      handleSignOut,
      handleDeleteOrder,
      handleDeleteCustomer,
      handleBulkDelete,
      toggleOrderSelection,
      toggleAllOrders,
      clearSelection,
    }),
    [
      orders, customers, filteredOrders, filteredCustomers, todaysPickups, stats, userEmail,
      searchQuery, statusFilter, customerSearchTerm, activeTab, selectedOrderIds, isRefreshing,
      deletingCustomerId,       deletingOrderId, isBulkDeleting, handleRefresh,
      handleSignOut, handleDeleteOrder, handleDeleteCustomer, handleBulkDelete,
      toggleOrderSelection, toggleAllOrders, clearSelection,
    ],
  )

  return <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>
}
