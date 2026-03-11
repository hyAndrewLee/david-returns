import { type NextRequest, NextResponse } from "next/server"
import { uploadToStorage } from "@/lib/supabase/storage"

export const POST = async (request: NextRequest) => {
  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error("[upload] Failed to parse FormData:", parseError)
      return NextResponse.json({ error: "Failed to parse upload data" }, { status: 400 })
    }

    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.size || file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    const result = await uploadToStorage(file, file.name, file.type, "labels")

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      url: result.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[upload] Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed unexpectedly" },
      { status: 500 },
    )
  }
}
