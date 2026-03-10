import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const POST = async (request: Request) => {
  try {
    const { username, password } = await request.json()

    const adminUsername = process.env.ADMIN_USERNAME || "admin"
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: "Admin credentials not configured" }, { status: 500 })
    }

    if (username === adminUsername && password === adminPassword) {
      const cookieStore = await cookies()

      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })

      return NextResponse.json({ success: true, redirectUrl: "/manage/dashboard" })
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
