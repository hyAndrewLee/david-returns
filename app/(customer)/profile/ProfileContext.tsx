"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { trpc } from "@/lib/trpc"
import type { Profile as DbProfile, Address as DbAddress, Subscription as DbSubscription } from "@/server/db/schema"

export type ProfileFormData = {
  fullName: string
  phone: string
  streetAddress: string
  apt: string
  city: string
  zip: string
  buildingName: string
  notes: string
}

type ProfileContextValue = {
  formData: ProfileFormData
  setFormData: (data: ProfileFormData) => void
  saving: boolean
  saved: boolean
  error: string
  canceling: boolean
  showCancelConfirm: boolean
  setShowCancelConfirm: (show: boolean) => void
  handleSignOut: () => Promise<void>
  handleSave: () => Promise<void>
  handleCancelMembership: () => Promise<void>
  isMember: boolean
  isCanceling: boolean
  userEmail: string
  subscription: DbSubscription | null
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export const useProfile = () => {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}

type ProfileProviderProps = {
  children: React.ReactNode
  profile: DbProfile | null
  defaultAddress: DbAddress | null
  userEmail: string
  subscription?: DbSubscription | null
}

export const ProfileProvider = ({
  children,
  profile,
  defaultAddress,
  userEmail,
  subscription = null,
}: ProfileProviderProps) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [canceling, setCanceling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const cancelMutation = trpc.stripe.cancelMembership.useMutation()

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
    streetAddress: defaultAddress?.streetAddress || "",
    apt: defaultAddress?.apt || "",
    city: defaultAddress?.city || "",
    zip: defaultAddress?.zip || "",
    buildingName: defaultAddress?.buildingName || "",
    notes: defaultAddress?.notes || "",
  })

  const handleSignOut = useCallback(async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }, [router])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Not authenticated")
        return
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      if (defaultAddress?.id) {
        const { error: addressError } = await supabase
          .from("addresses")
          .update({
            full_name: formData.fullName,
            phone: formData.phone,
            street_address: formData.streetAddress,
            apt: formData.apt || null,
            city: formData.city,
            zip: formData.zip,
            building_name: formData.buildingName || null,
            notes: formData.notes || null,
          })
          .eq("id", defaultAddress.id)

        if (addressError) throw addressError
      } else {
        const { error: addressError } = await supabase.from("addresses").insert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          street_address: formData.streetAddress,
          apt: formData.apt || null,
          city: formData.city,
          zip: formData.zip,
          building_name: formData.buildingName || null,
          notes: formData.notes || null,
          is_default: true,
          label: "Home",
        })

        if (addressError) throw addressError
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (err) {
      console.error("Save error:", err)
      setError("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }, [formData, defaultAddress, router])

  const handleCancelMembership = useCallback(async () => {
    setCanceling(true)
    setError("")

    try {
      await cancelMutation.mutateAsync()
      setShowCancelConfirm(false)
      setSaved(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error("Cancel error:", err)
      setError("Failed to cancel membership. Please try again.")
    } finally {
      setCanceling(false)
    }
  }, [cancelMutation, router])

  const isMember = !!subscription && subscription.status === "active"
  const isCanceling = subscription?.status === "canceling"

  return (
    <ProfileContext.Provider
      value={{
        formData,
        setFormData,
        saving,
        saved,
        error,
        canceling,
        showCancelConfirm,
        setShowCancelConfirm,
        handleSignOut,
        handleSave,
        handleCancelMembership,
        isMember,
        isCanceling: !!isCanceling,
        userEmail,
        subscription: subscription ?? null,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
