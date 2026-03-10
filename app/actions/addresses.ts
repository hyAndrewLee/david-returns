"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function fetchUserAddresses() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { addresses: [], error: "Not authenticated" }
  }

  const adminClient = createAdminClient()
  const { data: addresses, error } = await adminClient
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  if (error) {
    return { addresses: [], error: error.message }
  }

  return { addresses: addresses || [], error: null }
}

export async function fetchUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { profile: null, error: "Not authenticated" }
  }

  const adminClient = createAdminClient()
  const { data: profile, error } = await adminClient.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    return { profile: null, error: error.message }
  }

  return { profile, error: null }
}
