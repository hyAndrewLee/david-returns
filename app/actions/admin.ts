"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export const deleteCustomer = async (customerId: string) => {
  const supabase = createAdminClient()

  // Delete from addresses table first (foreign key constraint)
  await supabase.from("addresses").delete().eq("user_id", customerId)

  // Delete from subscriptions if exists
  await supabase.from("subscriptions").delete().eq("user_id", customerId)

  // Delete from orders if exists
  await supabase.from("orders").delete().eq("user_id", customerId)

  // Delete from profiles table
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", customerId)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  // Delete from auth.users using admin API
  const { error: authError } = await supabase.auth.admin.deleteUser(customerId)

  if (authError) {
    return { success: false, error: authError.message }
  }

  return { success: true }
}
