"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogOut, Save, Loader2, CheckCircle, Crown, AlertTriangle } from "lucide-react"
import { cancelMembership } from "@/app/actions/stripe"

type Profile = {
  id: string
  full_name: string
  phone: string
  email: string
} | null

type Address = {
  id: string
  street_address: string
  apt: string | null
  city: string
  zip: string
  building_name: string | null
  notes: string | null
} | null

type Subscription = {
  id: string
  status: string
  plan: string
  current_period_end: string
  stripe_subscription_id: string
} | null

export const ProfileForm = ({
  profile,
  defaultAddress,
  userEmail,
  subscription,
}: {
  profile: Profile
  defaultAddress: Address
  userEmail: string
  subscription?: Subscription
}) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [canceling, setCanceling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    streetAddress: defaultAddress?.street_address || "",
    apt: defaultAddress?.apt || "",
    city: defaultAddress?.city || "",
    zip: defaultAddress?.zip || "",
    buildingName: defaultAddress?.building_name || "",
    notes: defaultAddress?.notes || "",
  })

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleSave = async () => {
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

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Update or insert default address
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
        // Create new default address
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
  }

  const handleCancelMembership = async () => {
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
  }

  const isMember = !!subscription && subscription.status === "active"
  const isCanceling = subscription?.status === "canceling"

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/images/david-returns-logo.png"
                alt="David Returns"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-foreground mb-6">Profile Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Changes saved successfully!
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main Content Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </CardContent>
            </Card>

            {/* Default Pickup Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Default Pickup Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="apt">Apt / Suite (optional)</Label>
                    <Input
                      id="apt"
                      value={formData.apt}
                      onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
                      placeholder="Apt 4B"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingName">Building Name (optional)</Label>
                    <Input
                      id="buildingName"
                      value={formData.buildingName}
                      onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                      placeholder="The Towers"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Delivery Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Leave at front desk, call when arriving, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {isMember ? (
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-orange-500" />
                    Unlimited Membership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Status</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isCanceling ? "Cancels" : "Renews"} on{" "}
                        {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">$14.99</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>

                  {isCanceling ? (
                    <div className="rounded-lg bg-amber-100 border border-amber-200 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900">Membership Canceling</p>
                          <p className="text-xs text-amber-700 mt-1">
                            You'll keep your benefits until{" "}
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-lg bg-orange-100 border border-orange-200 p-3">
                        <p className="text-sm text-orange-900">
                          <strong>Unlimited pickups</strong> - All returns are free with your membership
                        </p>
                      </div>

                      {!showCancelConfirm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCancelConfirm(true)}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Cancel Membership
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Are you sure? You'll lose unlimited free pickups.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCancelConfirm(false)}
                              className="flex-1"
                              disabled={canceling}
                            >
                              Keep Membership
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleCancelMembership}
                              className="flex-1"
                              disabled={canceling}
                            >
                              {canceling ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Canceling...
                                </>
                              ) : (
                                "Confirm Cancel"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-orange-500" />
                    Membership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground mb-2">You don't have an active membership</p>
                    <p className="text-3xl font-bold text-orange-600 mb-1">$14.99</p>
                    <p className="text-xs text-muted-foreground mb-4">per month</p>
                  </div>

                  <div className="rounded-lg bg-orange-100 border border-orange-200 p-3 space-y-2">
                    <p className="text-sm font-medium text-orange-900">Get unlimited returns</p>
                    <ul className="text-xs text-orange-800 space-y-1 ml-4 list-disc">
                      <li>Free pickups for all returns</li>
                      <li>Cancel anytime</li>
                      <li>Priority support</li>
                    </ul>
                  </div>

                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <Link href="/schedule">Get Membership</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Start your first return to activate membership
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
