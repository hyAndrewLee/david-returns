import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/heic",
            "image/heif",
            "application/pdf",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          addRandomSuffix: true, // Always generate unique filenames
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[v0] Blob upload completed:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[v0] Blob upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 400 })
  }
}
