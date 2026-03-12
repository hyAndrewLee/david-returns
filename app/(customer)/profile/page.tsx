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
import { eq, and } from "drizzle-orm"

const ProfilePage = async () => {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const [profile] = await adminDb
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, user.id))
    .limit(1)

  const [defaultAddress] = await adminDb
    .select()
    .from(addressesTable)
    .where(and(eq(addressesTable.userId, user.id), eq(addressesTable.isDefault, true)))
    .limit(1)

  const [subscription] = await adminDb
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, user.id),
        eq(subscriptionsTable.status, "active"),
        eq(subscriptionsTable.plan, "membership"),
      ),
    )
    .limit(1)

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
