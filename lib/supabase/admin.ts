import { createClient } from "@supabase/supabase-js"

// Admin client with service role - bypasses RLS
// Only use this for admin operations
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[v0] Missing Supabase admin env vars:", {
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasSecretKey: !!process.env.SUPABASE_SECRET_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    })
    throw new Error("Missing Supabase admin environment variables")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
