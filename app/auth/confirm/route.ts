import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

export const GET = async (request: NextRequest) => {
  try {
    const debugId = randomUUID().slice(0, 8)
    const requestUrl = new URL(request.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`

    const token_hash = requestUrl.searchParams.get("token_hash")
    const type = requestUrl.searchParams.get("type")

    console.log(`[v0][${debugId}] Email confirmation request`)
    console.log(`[v0][${debugId}] URL: ${request.url}`)
    console.log(`[v0][${debugId}] Base URL: ${baseUrl}`)
    console.log(`[v0][${debugId}] token_hash present: ${!!token_hash}`)
    console.log(`[v0][${debugId}] type: ${type}`)

    const host = request.headers.get("host") || ""
    console.log(`[v0][${debugId}] Host: ${host}`)

    if (!token_hash || type !== "signup") {
      console.log(`[v0][${debugId}] Missing or invalid parameters`)
      const redirectUrl = new URL("/auth/confirmed", baseUrl)
      redirectUrl.searchParams.set("status", "error")
      redirectUrl.searchParams.set("reason", "invalid_params")
      redirectUrl.searchParams.set("debug_id", debugId)
      redirectUrl.searchParams.set("error", "Invalid confirmation link")
      return NextResponse.redirect(redirectUrl)
    }

    const supabase = await createClient()

    console.log(`[v0][${debugId}] Verifying OTP with token_hash...`)

    const { data, error } = await supabase.auth.verifyOtp({
      type: "signup",
      token_hash,
    })

    if (error) {
      console.error(`[v0][${debugId}] OTP verification failed:`, error)
      const redirectUrl = new URL("/auth/confirmed", baseUrl)
      redirectUrl.searchParams.set("status", "error")
      redirectUrl.searchParams.set("reason", "verification_failed")
      redirectUrl.searchParams.set("debug_id", debugId)
      redirectUrl.searchParams.set("error", error.message)
      return NextResponse.redirect(redirectUrl)
    }

    if (!data.user) {
      console.log(`[v0][${debugId}] No user returned from verification`)
      const redirectUrl = new URL("/auth/confirmed", baseUrl)
      redirectUrl.searchParams.set("status", "error")
      redirectUrl.searchParams.set("reason", "no_user")
      redirectUrl.searchParams.set("debug_id", debugId)
      redirectUrl.searchParams.set("error", "User not found")
      return NextResponse.redirect(redirectUrl)
    }

    console.log(`[v0][${debugId}] Email confirmed successfully for user: ${data.user.id}`)

    const redirectUrl = new URL("/auth/confirmed", baseUrl)
    redirectUrl.searchParams.set("status", "success")
    redirectUrl.searchParams.set("continue", "true")
    redirectUrl.searchParams.set("debug_id", debugId)
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error(`[v0] Unexpected error in confirm route:`, err)
    const errorDebugId = randomUUID().slice(0, 8)
    const requestUrl = new URL(request.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    const redirectUrl = new URL("/auth/confirmed", baseUrl)
    redirectUrl.searchParams.set("status", "error")
    redirectUrl.searchParams.set("reason", "exception")
    redirectUrl.searchParams.set("debug_id", errorDebugId)
    redirectUrl.searchParams.set("error", err instanceof Error ? err.message : "Unknown error occurred")
    return NextResponse.redirect(redirectUrl)
  }
}
