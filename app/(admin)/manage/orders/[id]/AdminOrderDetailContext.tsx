"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { trpc } from "@/lib/trpc"
import { STATUS_COLORS, STATUS_LABELS, type OrderStatus } from "@/lib/constants"

export type Order = {
  id: string
  createdAt: Date | null
  pickupDate: string
  pickupTime: string
  pickupMethod?: string | null
  address: any
  items: any
  isInstant: boolean | null
  status: OrderStatus
  totalAmount: number
  profiles?: {
    fullName: string | null
    email: string | null
    phone: string | null
  } | null
  adminNotes?: string | null
}

type AdminOrderDetailContextValue = {
  order: Order
  adminNotes: string
  isSaving: boolean
  isUpdatingStatus: boolean
  setAdminNotes: (notes: string) => void
  handleSave: () => Promise<void>
  handleUpdateStatus: (status: OrderStatus) => Promise<void>
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
}

const AdminOrderDetailContext = createContext<AdminOrderDetailContextValue | null>(null)

export const useAdminOrderDetail = () => {
  const ctx = useContext(AdminOrderDetailContext)
  if (!ctx) throw new Error("useAdminOrderDetail must be used within AdminOrderDetailProvider")
  return ctx
}

export const AdminOrderDetailProvider = ({
  children,
  initialOrder,
}: {
  children: React.ReactNode
  initialOrder: Order
}) => {
  const [order, setOrder] = useState(initialOrder)
  const [adminNotes, setAdminNotes] = useState(initialOrder.adminNotes || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const router = useRouter()

  const updateNotesMutation = trpc.orders.updateNotes.useMutation()
  const updateStatusMutation = trpc.orders.updateStatus.useMutation()

  useEffect(() => {
    setOrder(initialOrder)
    setAdminNotes(initialOrder.adminNotes || "")
  }, [initialOrder])

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    const channel = supabase
      .channel(`admin-order-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        () => {
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id, router])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await updateNotesMutation.mutateAsync({
        orderId: order.id,
        adminNotes,
      })
      router.refresh()
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setIsSaving(false)
    }
  }, [order.id, adminNotes, updateNotesMutation, router])

  const handleUpdateStatus = useCallback(async (status: OrderStatus) => {
    const previousStatus = order.status
    setOrder((prev) => ({ ...prev, status }))
    setIsUpdatingStatus(true)
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status,
      })
      router.refresh()
    } catch (error) {
      setOrder((prev) => ({ ...prev, status: previousStatus }))
      console.error("Error updating status:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }, [order.id, order.status, updateStatusMutation, router])

  return (
    <AdminOrderDetailContext.Provider
      value={{
        order,
        adminNotes,
        isSaving,
        isUpdatingStatus,
        setAdminNotes,
        handleSave,
        handleUpdateStatus,
        statusColors: STATUS_COLORS,
        statusLabels: STATUS_LABELS,
      }}
    >
      {children}
    </AdminOrderDetailContext.Provider>
  )
}
