"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
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
}

export type DashboardProfile = {
  full_name: string
  email: string
  phone: string
} | null

export type DashboardSubscription = {
  status: string
  plan: string
  current_period_end: string
} | null

type DashboardContextValue = {
  activeOrders: Order[]
  pastOrders: Order[]
  showPastOrders: boolean
  setShowPastOrders: (show: boolean) => void
  showContactDialog: boolean
  setShowContactDialog: (show: boolean) => void
  handleSignOut: () => Promise<void>
  isMember: boolean
  isFirstTime: boolean
  firstName: string
  displayName: string
  profile: DashboardProfile
  userEmail: string
  subscription: DashboardSubscription
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export const useDashboard = () => {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}

type DashboardProviderProps = {
  children: React.ReactNode
  activeOrders: Order[]
  pastOrders: Order[]
  profile: DashboardProfile
  userEmail: string
  subscription?: DashboardSubscription
}

export const DashboardProvider = ({
  children,
  activeOrders: initialActiveOrders,
  pastOrders: initialPastOrders,
  profile,
  userEmail,
  subscription = null,
}: DashboardProviderProps) => {
  const router = useRouter()
  const [activeOrders, setActiveOrders] = useState(initialActiveOrders)
  const [pastOrders, setPastOrders] = useState(initialPastOrders)
  const [showPastOrders, setShowPastOrders] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("dashboard-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          const fetchOrders = async () => {
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser()
              if (!user) return

              const { data: orders, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

              if (error) {
                console.error("Error fetching orders:", error)
                return
              }

              if (orders) {
                const active = orders.filter(
                  (order) => !["completed", "cancelled"].includes(order.tracking_status || "pending"),
                )
                const past = orders.filter((order) =>
                  ["completed", "cancelled"].includes(order.tracking_status || ""),
                )
                setActiveOrders(active)
                setPastOrders(past)
              }
            } catch (err) {
              console.error("Exception in fetchOrders:", err)
            }
          }

          fetchOrders()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }, [router])

  const isMember = !!subscription && subscription.status === "active"
  const isFirstTime = initialActiveOrders.length === 0 && initialPastOrders.length === 0

  const firstName = (() => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name.split(" ")[0]
    }
    const emailName = userEmail.split("@")[0]
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  })()

  const displayName = profile?.full_name || userEmail

  return (
    <DashboardContext.Provider
      value={{
        activeOrders,
        pastOrders,
        showPastOrders,
        setShowPastOrders,
        showContactDialog,
        setShowContactDialog,
        handleSignOut,
        isMember,
        isFirstTime,
        firstName,
        displayName,
        profile,
        userEmail,
        subscription: subscription ?? null,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
