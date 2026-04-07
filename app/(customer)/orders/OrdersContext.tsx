"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import type { Order as DbOrder, Profile as DbProfile } from "@/server/db/schema"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"

type OrdersContextValue = {
  orders: DbOrder[]
  profile: DbProfile | null
  userEmail: string
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
  handleSignOut: () => Promise<void>
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

export const useOrders = () => {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider")
  return ctx
}

type OrdersProviderProps = {
  children: React.ReactNode
  initialOrders: DbOrder[]
  profile: DbProfile | null
  userEmail: string
}

export const OrdersProvider = ({ children, initialOrders, profile, userEmail }: OrdersProviderProps) => {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    const channel = supabase
      .channel("orders-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        router.refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        profile,
        userEmail,
        statusColors: STATUS_COLORS,
        statusLabels: STATUS_LABELS,
        handleSignOut,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}
