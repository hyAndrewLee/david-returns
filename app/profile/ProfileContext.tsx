"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { cancelMembership } from "@/app/actions/stripe"

export type ProfileData = {
  id: string
  full_name: string
  phone: string
  email: string
} | null

export type ProfileAddress = {
  id: string
  street_address: string
  apt: string | null
  city: string
  zip: string
  building_name: string | null
  notes: string | null
} | null

export type ProfileSubscription = {
  id: string
  status: string
  plan: string
  current_period_end: string
  stripe_subscription_id: string
} | null

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
  subscription: ProfileSubscription
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export const useProfile = () => {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}

type ProfileProviderProps = {
  children: React.ReactNode
  profile: ProfileData
  defaultAddress: ProfileAddress
  userEmail: string
  subscription?: ProfileSubscription
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

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    streetAddress: defaultAddress?.street_address || "",
    apt: defaultAddress?.apt || "",
    city: defaultAddress?.city || "",
    zip: defaultAddress?.zip || "",
    buildingName: defaultAddress?.building_name || "",
    notes: defaultAddress?.notes || "",
  })

  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }, [router])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const supabase = createClient()
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

  const handleCancelMembershipAction = useCallback(async () => {
    setCanceling(true)
    setError("")

    try {
      await cancelMembership()
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
  }, [router])

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
        handleCancelMembership: handleCancelMembershipAction,
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
