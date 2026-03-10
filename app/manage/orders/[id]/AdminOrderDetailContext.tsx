"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { updateOrderStatus, uploadProofImage } from "@/app/manage/actions"
import { createClient } from "@/lib/supabase/client"

export type Order = {
  id: string
  created_at: string
  pickup_date: string
  pickup_time: string
  pickup_method?: string
  address: {
    fullName: string
    phone: string
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
    labelType?: string
    packageSize?: string
    notes?: string
    returnTo?: string
    returnToOther?: string
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
  proof_pickup_url?: string
  proof_delivery_url?: string
  proof_return_url?: string
  picked_up_at?: string
  delivered_at?: string
  return_confirmed_at?: string
  admin_notes?: string
  tracking_number?: string
}

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

export const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const statusSteps = ["pending", "in_progress", "completed"]

type AdminOrderDetailContextValue = {
  order: Order
  currentStepIndex: number
  trackingStatus: string
  adminNotes: string
  trackingNumber: string
  isSaving: boolean
  uploadingType: string | null
  setTrackingStatus: (status: string) => void
  setAdminNotes: (notes: string) => void
  setTrackingNumber: (number: string) => void
  handleSave: () => Promise<void>
  handleUploadProof: (type: "pickup" | "delivery" | "return", file: File) => Promise<void>
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
  statusSteps: string[]
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
  const [trackingStatus, setTrackingStatus] = useState(initialOrder.tracking_status || "pending")
  const [adminNotes, setAdminNotes] = useState(initialOrder.admin_notes || "")
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.tracking_number || "")
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const router = useRouter()

  const currentStepIndex = statusSteps.indexOf(trackingStatus)

  useEffect(() => {
    const supabase = createClient()

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
        (payload) => {
          setOrder(payload.new as Order)
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
      await updateOrderStatus(order.id, {
        tracking_status: trackingStatus,
        admin_notes: adminNotes,
        tracking_number: trackingNumber,
      })
      router.refresh()
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setIsSaving(false)
    }
  }, [order.id, trackingStatus, adminNotes, trackingNumber, router])

  const handleUploadProof = useCallback(
    async (type: "pickup" | "delivery" | "return", file: File) => {
      try {
        setUploadingType(type)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("orderId", order.id)
        formData.append("type", type)

        await uploadProofImage(formData)

        router.refresh()
      } catch (error) {
        console.error("Failed to upload proof:", error)
      } finally {
        setUploadingType(null)
      }
    },
    [order.id, router],
  )

  return (
    <AdminOrderDetailContext.Provider
      value={{
        order,
        currentStepIndex,
        trackingStatus,
        adminNotes,
        trackingNumber,
        isSaving,
        uploadingType,
        setTrackingStatus,
        setAdminNotes,
        setTrackingNumber,
        handleSave,
        handleUploadProof,
        statusColors,
        statusLabels,
        statusSteps,
      }}
    >
      {children}
    </AdminOrderDetailContext.Provider>
  )
}
