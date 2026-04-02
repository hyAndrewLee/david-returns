"use client"

import Link from "next/link"
import { ArrowLeft, Save, Loader2, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useProfile } from "@/app/(customer)/profile/ProfileContext"
import { ProfileHeader } from "@/components/customer/ProfileHeader"
import { ProfilePersonalInfo } from "@/components/customer/ProfilePersonalInfo"
import { ProfileAddress } from "@/components/customer/ProfileAddress"
import { ProfileMembershipCard } from "@/components/customer/ProfileMembershipCard"

export const ProfileForm = () => {
  const { saving, saved, error, handleSave } = useProfile()

  return (
    <div className="min-h-screen bg-linear-to-b from-surface-container-low to-surface">
      <ProfileHeader />

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
          <div className="mb-6 p-4 bg-destructive/8 border border-[rgba(26,26,46,0.1)] rounded-[0.375rem] text-destructive text-sm">{error}</div>
        )}

        {saved && (
          <div className="mb-6 p-4 bg-accent-green-light border border-[rgba(26,26,46,0.1)] rounded-[0.375rem] text-accent-green text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Changes saved successfully!
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <ProfilePersonalInfo />
            <ProfileAddress />

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="w-full"
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
            <ProfileMembershipCard />
          </div>
        </div>
      </main>
    </div>
  )
}
