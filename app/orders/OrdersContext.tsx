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
  }
  items: Array<{
    retailer: string
    description?: string
  }>
  is_instant: boolean
  tracking_status: string
  total_amount: number
  proof_pickup_url?: string
  proof_delivery_url?: string
  proof_return_url?: string
}

export type Profile = {
  full_name: string
  email: string
  phone: string
} | null

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

export const statusLabels: Record<string, string> = {
  pending: "Pending Pickup",
  in_progress: "Picked Up",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const statusDescriptions: Record<string, string> = {
  pending: "Your package is scheduled for pickup",
  in_progress: "We've picked up your package and are processing your return",
  completed: "Your return has been completed",
  cancelled: "This order was cancelled",
}

type OrdersContextValue = {
  orders: Order[]
  profile: Profile
  userEmail: string
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
  statusDescriptions: Record<string, string>
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
  initialOrders: Order[]
  profile: Profile
  userEmail: string
}

export const OrdersProvider = ({ children, initialOrders, profile, userEmail }: OrdersProviderProps) => {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("orders-list")
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
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
        statusColors,
        statusLabels,
        statusDescriptions,
        handleSignOut,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}
