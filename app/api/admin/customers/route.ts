import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // Fetch customers
    const { data: customers, error } = await adminClient
      .from("profiles")
      .select(`
        *,
        addresses (
          street_address,
          apt,
          city,
          zip,
          is_default
        ),
        subscriptions (
          status,
          plan
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching customers:", error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ customers, count: customers?.length || 0 })
  } catch (err) {
    console.error("[v0] Unexpected error:", err)
    return NextResponse.json({ error: "Unexpected error", details: String(err) }, { status: 500 })
  }
}
