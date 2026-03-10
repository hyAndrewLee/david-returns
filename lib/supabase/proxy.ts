import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip Supabase session handling if env vars not set
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if accessing protected routes without auth
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/signin"
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith("/manage") && !request.nextUrl.pathname.startsWith("/manage/login")) {
    console.log("[v0] Middleware: Checking admin access for", request.nextUrl.pathname)

    // Check for hardcoded admin session cookie first
    const adminSession = request.cookies.get("admin_session")

    if (adminSession?.value === "authenticated") {
      console.log("[v0] Middleware: Admin session cookie found - access granted")
      return supabaseResponse
    }

    console.log("[v0] Middleware: No admin session cookie, checking Supabase auth")

    if (!user) {
      console.log("[v0] Middleware: No user found, redirecting to login")
      const url = request.nextUrl.clone()
      url.pathname = "/manage/login"
      return NextResponse.redirect(url)
    }

    console.log("[v0] Middleware: User authenticated, checking admin status for user ID:", user.id)

    // Check if user is admin using service role client to bypass RLS
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!serviceRoleKey) {
      console.error("[v0] Middleware: Missing service role key")
      const url = request.nextUrl.clone()
      url.pathname = "/manage/login"
      return NextResponse.redirect(url)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("is_admin, email")
      .eq("id", user.id)
      .single()

    console.log("[v0] Middleware: Profile query result:", { profile, error })

    if (error) {
      console.error("[v0] Middleware: Profile query error:", error)
      const url = request.nextUrl.clone()
      url.pathname = "/manage/login"
      return NextResponse.redirect(url)
    }

    if (!profile?.is_admin) {
      console.log("[v0] Middleware: User is not admin (is_admin:", profile?.is_admin, "), redirecting to login")
      const url = request.nextUrl.clone()
      url.pathname = "/manage/login"
      return NextResponse.redirect(url)
    }

    console.log("[v0] Middleware: Admin check passed for", profile.email)
  }

  return supabaseResponse
}
