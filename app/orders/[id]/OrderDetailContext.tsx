"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

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
  }
  items: Array<{
    retailer: string
    description?: string
    hasLabel: boolean
    hasBox: boolean
    returnTo?: string
    returnToOther?: string
    labelFileUrl?: string
    photoUrl?: string
    labelType?: string
    notes?: string
  }>
  is_instant: boolean
  tracking_status: string
  tracking_number?: string
  total_amount: number
  proof_pickup_url?: string
  proof_delivery_url?: string
  proof_return_url?: string
  picked_up_at?: string
  delivered_at?: string
  return_confirmed_at?: string
}

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

export const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "Picked Up",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const statusSteps = ["pending", "in_progress", "completed"]

type OrderDetailContextValue = {
  order: Order
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
  statusSteps: string[]
  currentStepIndex: number
}

const OrderDetailContext = createContext<OrderDetailContextValue | null>(null)

export const useOrderDetail = () => {
  const ctx = useContext(OrderDetailContext)
  if (!ctx) throw new Error("useOrderDetail must be used within OrderDetailProvider")
  return ctx
}

type OrderDetailProviderProps = {
  children: React.ReactNode
  initialOrder: Order
}

export const OrderDetailProvider = ({ children, initialOrder }: OrderDetailProviderProps) => {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const currentStepIndex = statusSteps.indexOf(order.tracking_status || "pending")

  useEffect(() => {
    setOrder(initialOrder)
  }, [initialOrder])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`order-${order.id}`)
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

  return (
    <OrderDetailContext.Provider
      value={{
        order,
        statusColors,
        statusLabels,
        statusSteps,
        currentStepIndex,
      }}
    >
      {children}
    </OrderDetailContext.Provider>
  )
}
