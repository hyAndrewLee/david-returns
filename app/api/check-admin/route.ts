import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const POST = async (request: Request) => {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ isAdmin: false, error: "No user ID provided" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

    if (error) {
      return NextResponse.json({ isAdmin: false, error: error.message }, { status: 500 })
    }

    const isAdmin = profile?.is_admin === true

    return NextResponse.json({
      isAdmin,
      profile,
    })
  } catch (error) {
    return NextResponse.json({ isAdmin: false, error: "Internal server error" }, { status: 500 })
  }
}
