"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { trpc } from "@/lib/trpc"
import { STATUS_COLORS, STATUS_LABELS, STATUS_STEPS } from "@/lib/constants"

export type Order = {
  id: string
  createdAt: Date | null
  pickupDate: string
  pickupTime: string
  pickupMethod?: string | null
  address: any
  items: any
  isInstant: boolean | null
  status: string
  trackingStatus: string | null
  totalAmount: number
  profiles?: {
    fullName: string | null
    email: string | null
    phone: string | null
  } | null
  proofPickupUrl?: string | null
  proofDeliveryUrl?: string | null
  proofReturnUrl?: string | null
  pickedUpAt?: Date | null
  deliveredAt?: Date | null
  returnConfirmedAt?: Date | null
  adminNotes?: string | null
  trackingNumber?: string | null
}

export { STATUS_COLORS as statusColors, STATUS_LABELS as statusLabels, STATUS_STEPS as statusSteps }

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
  statusSteps: readonly string[]
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
  const [trackingStatus, setTrackingStatus] = useState(initialOrder.trackingStatus || "pending")
  const [adminNotes, setAdminNotes] = useState(initialOrder.adminNotes || "")
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.trackingNumber || "")
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const router = useRouter()

  const updateStatusMutation = trpc.orders.updateStatus.useMutation()
  const uploadProofMutation = trpc.upload.uploadProof.useMutation()

  const currentStepIndex = STATUS_STEPS.indexOf(
    trackingStatus as (typeof STATUS_STEPS)[number],
  )

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
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        trackingStatus,
        adminNotes,
        trackingNumber,
      })
      router.refresh()
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setIsSaving(false)
    }
  }, [order.id, trackingStatus, adminNotes, trackingNumber, updateStatusMutation, router])

  const handleUploadProof = useCallback(
    async (type: "pickup" | "delivery" | "return", file: File) => {
      try {
        setUploadingType(type)

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        await uploadProofMutation.mutateAsync({
          orderId: order.id,
          type,
          base64,
          name: file.name,
          contentType: file.type,
        })

        router.refresh()
      } catch (error) {
        console.error("Failed to upload proof:", error)
      } finally {
        setUploadingType(null)
      }
    },
    [order.id, uploadProofMutation, router],
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
        statusColors: STATUS_COLORS,
        statusLabels: STATUS_LABELS,
        statusSteps: STATUS_STEPS,
      }}
    >
      {children}
    </AdminOrderDetailContext.Provider>
  )
}
