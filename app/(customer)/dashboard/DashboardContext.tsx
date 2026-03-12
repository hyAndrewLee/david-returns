"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import type { Order as DbOrder, Profile as DbProfile, Subscription as DbSubscription } from "@/server/db/schema"

export type DashboardContextValue = {
  activeOrders: DbOrder[]
  pastOrders: DbOrder[]
  showPastOrders: boolean
  setShowPastOrders: (show: boolean) => void
  showContactDialog: boolean
  setShowContactDialog: (show: boolean) => void
  handleSignOut: () => Promise<void>
  isMember: boolean
  isFirstTime: boolean
  firstName: string
  displayName: string
  profile: DbProfile | null
  userEmail: string
  subscription: DbSubscription | null
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export const useDashboard = () => {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}

type DashboardProviderProps = {
  children: React.ReactNode
  activeOrders: DbOrder[]
  pastOrders: DbOrder[]
  profile: DbProfile | null
  userEmail: string
  subscription?: DbSubscription | null
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
    setActiveOrders(initialActiveOrders)
    setPastOrders(initialPastOrders)
  }, [initialActiveOrders, initialPastOrders])

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    const channel = supabase
      .channel("dashboard-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        router.refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const handleSignOut = useCallback(async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }, [router])

  const isMember = !!subscription && subscription.status === "active"
  const isFirstTime = initialActiveOrders.length === 0 && initialPastOrders.length === 0

  const firstName = (() => {
    if (profile?.fullName && profile.fullName.trim()) {
      return profile.fullName.split(" ")[0]
    }
    const emailName = userEmail.split("@")[0]
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  })()

  const displayName = profile?.fullName || userEmail

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
