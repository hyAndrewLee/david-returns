"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import type { Order as DbOrder } from "@/server/db/schema"
import { STATUS_COLORS, STATUS_LABELS, STATUS_STEPS } from "@/lib/constants"

type OrderDetailContextValue = {
  order: DbOrder
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
  statusSteps: readonly string[]
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
  initialOrder: DbOrder
}

export const OrderDetailProvider = ({ children, initialOrder }: OrderDetailProviderProps) => {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const currentStepIndex = STATUS_STEPS.indexOf(
    (order.trackingStatus || "pending") as (typeof STATUS_STEPS)[number],
  )

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

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
        () => {
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
        statusColors: STATUS_COLORS,
        statusLabels: STATUS_LABELS,
        statusSteps: STATUS_STEPS,
        currentStepIndex,
      }}
    >
      {children}
    </OrderDetailContext.Provider>
  )
}
