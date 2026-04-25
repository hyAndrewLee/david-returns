import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { tryNotifySignup } from "@/server/services/userNotifications"

const CANONICAL_DOMAIN = "www.davidreturns.com"

const generateDebugId = (): string => {
  return `dbg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export const GET = async (request: NextRequest) => {
  const debugId = generateDebugId()
  const requestUrl = new URL(request.url)

  // Extract all params
  const code = requestUrl.searchParams.get("code")
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const redirect_to = requestUrl.searchParams.get("redirect_to")
  const next = requestUrl.searchParams.get("next") || "/signin?confirmed=true"

  // Capture request details
  const host = request.headers.get("host") || ""
  const xForwardedHost = request.headers.get("x-forwarded-host")
  const xForwardedProto = request.headers.get("x-forwarded-proto")
  const cookieHeader = request.headers.get("cookie")

  console.log(`[v0] [${debugId}] Auth callback started`, {
    url: request.url,
    host,
    xForwardedHost,
    xForwardedProto,
    hasCookies: !!cookieHeader,
    cookieCount: cookieHeader?.split(";").length || 0,
    params: {
      hasCode: !!code,
      hasTokenHash: !!token_hash,
      type,
      hasRedirectTo: !!redirect_to,
      next,
    },
  })

  if (host && !host.includes(CANONICAL_DOMAIN) && !host.includes("localhost")) {
    const canonicalUrl = `https://${CANONICAL_DOMAIN}${requestUrl.pathname}${requestUrl.search}`
    console.log(`[v0] [${debugId}] Redirecting to canonical domain: ${canonicalUrl}`)
    return NextResponse.redirect(canonicalUrl)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  if (code) {
    console.log(`[v0] [${debugId}] BRANCH=oauth_code`)

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(`[v0] [${debugId}] OAuth code exchange failed`, {
        error: error.message,
        code: error.code,
        status: error.status,
        fullError: JSON.stringify(error),
      })
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/confirm?status=error&reason=oauth_code_exchange_failed&debug_id=${debugId}&error=${encodeURIComponent(error.message)}`,
      )
    }

    console.log(`[v0] [${debugId}] OAuth code exchange successful`, {
      userId: data.user?.id,
      hasSession: !!data.session,
    })

    await tryNotifySignup(data.user, debugId)

    return NextResponse.redirect(
      `${requestUrl.origin}/auth/confirm?status=success&reason=oauth_completed&debug_id=${debugId}`,
    )
  }

  if (token_hash && type) {
    console.log(`[v0] [${debugId}] BRANCH=email_token_hash`, { type })

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "magiclink" | "email_change" | "invite" | "email",
    })

    if (error) {
      console.error(`[v0] [${debugId}] Email token verification failed`, {
        error: error.message,
        code: error.code,
        status: error.status,
        type,
        fullError: JSON.stringify(error),
      })
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/confirm?status=error&reason=email_verification_failed&debug_id=${debugId}&type=${type}&error=${encodeURIComponent(error.message)}`,
      )
    }

    console.log(`[v0] [${debugId}] Email verification successful`, {
      userId: data.user?.id,
      hasSession: !!data.session,
    })

    if (type === "signup") {
      await tryNotifySignup(data.user, debugId)
    }

    // Redirect to client page to handle profile/address setup
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/confirm?status=success&reason=email_confirmed&debug_id=${debugId}&continue=true`,
    )
  }

  console.error(`[v0] [${debugId}] BRANCH=missing_token_or_code - No valid auth params found`)
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/confirm?status=error&reason=missing_token_or_code&debug_id=${debugId}&had_code=${!!code}&had_token=${!!token_hash}&had_type=${!!type}`,
  )
}
