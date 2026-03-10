"use server"

import { createClient } from "@/lib/supabase/server"

export const signUpAction = async (formData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  streetAddress: string
  apt: string
  city: string
  zip: string
}) => {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        street_address: formData.streetAddress,
        apt: formData.apt,
        city: formData.city,
        zip: formData.zip,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL || "https://www.davidreturns.com"}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    // Store address data for callback to save later
    const addressData = {
      streetAddress: formData.streetAddress,
      apt: formData.apt,
      city: formData.city,
      zip: formData.zip,
      fullName: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      userId: authData.user.id,
    }

    // Store in a secure way that persists across redirects
    // We'll use the user's metadata since localStorage won't work server-side
    return { success: true, addressData }
  }

  return { success: true }
}
