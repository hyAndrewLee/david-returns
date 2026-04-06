import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { createServerSupabaseClient } from "@/server/auth/supabase"
import { ProfileForm } from "@/components/customer/ProfileForm"
import { ProfileProvider } from "@/app/(customer)/profile/ProfileContext"
import { adminDb } from "@/server/db"
import {
  profiles as profilesTable,
  addresses as addressesTable,
  subscriptions as subscriptionsTable,
} from "@/server/db/schema"
import { eq, and, inArray } from "drizzle-orm"

export const metadata: Metadata = {
  title: "Profile Settings | David Returns",
  description: "Manage your profile, default pickup address, and membership settings.",
}

const ProfilePage = async () => {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const [[profile], [defaultAddress], [subscription]] = await Promise.all([
    adminDb
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, user.id))
      .limit(1),
    adminDb
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.userId, user.id), eq(addressesTable.isDefault, true)))
      .limit(1),
    adminDb
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, user.id),
          inArray(subscriptionsTable.status, ["active", "canceling"]),
          eq(subscriptionsTable.plan, "membership"),
        ),
      )
      .limit(1),
  ])

  return (
    <ProfileProvider
      profile={profile ?? null}
      defaultAddress={defaultAddress ?? null}
      userEmail={user.email || ""}
      subscription={subscription ?? null}
    >
      <ProfileForm />
    </ProfileProvider>
  )
}

export default ProfilePage
