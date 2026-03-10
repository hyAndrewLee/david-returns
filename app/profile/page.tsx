import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProfileForm } from "@/components/ProfileForm"
import { ProfileProvider } from "@/app/profile/ProfileContext"

const ProfilePage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const adminClient = createAdminClient()

  const { data: profile } = await adminClient.from("profiles").select("*").eq("id", user.id).single()

  const { data: defaultAddress } = await adminClient
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single()

  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("plan", "membership")
    .maybeSingle()

  return (
    <ProfileProvider
      profile={profile}
      defaultAddress={defaultAddress}
      userEmail={user.email || ""}
      subscription={subscription}
    >
      <ProfileForm />
    </ProfileProvider>
  )
}

export default ProfilePage
