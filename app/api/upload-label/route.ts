import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API route called")

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error("[v0] Failed to parse FormData:", parseError)
      return NextResponse.json({ error: "Failed to parse upload data" }, { status: 400 })
    }

    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided in FormData")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.size || file.size === 0) {
      console.log("[v0] File is empty")
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    console.log("[v0] File details:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    })

    let blob
    try {
      blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
      })
    } catch (blobError) {
      console.error("[v0] Blob upload failed:", blobError)
      return NextResponse.json(
        {
          error: blobError instanceof Error ? `Blob upload failed: ${blobError.message}` : "Blob upload failed",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Upload successful! URL:", blob.url)

    if (!blob.url) {
      console.error("[v0] Blob upload succeeded but no URL returned")
      return NextResponse.json({ error: "Upload succeeded but no URL returned" }, { status: 500 })
    }

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Unexpected upload API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed unexpectedly",
      },
      { status: 500 },
    )
  }
}
