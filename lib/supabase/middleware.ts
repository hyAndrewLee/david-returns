import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Admin email that can access /manage routes
const ADMIN_EMAIL = "davidqiu202@gmail.com"

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /manage routes - only admin email can access
  if (request.nextUrl.pathname.startsWith("/manage")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/manage/login"
      // Allow access to login page
      if (request.nextUrl.pathname === "/manage/login") {
        return supabaseResponse
      }
      return NextResponse.redirect(url)
    }

    // Check if user is admin
    if (user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
