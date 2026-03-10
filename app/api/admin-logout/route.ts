import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const POST = async () => {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")

  return NextResponse.json({ success: true })
}
