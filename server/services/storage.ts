import "server-only"

import { createAdminSupabaseClient } from "@/server/auth/supabase"
import crypto from "crypto"

const BUCKET = "orders"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024

type UploadResult = {
  url: string | null
  error: string | null
}

const getPublicUrl = (path: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`
}

export const uploadToStorage = async (
  file: Buffer | File,
  filename: string,
  contentType: string,
  folder = "labels",
): Promise<UploadResult> => {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { url: null, error: `File type "${contentType}" is not allowed.` }
  }

  const isBuffer = Buffer.isBuffer(file)
  const fileSize = isBuffer ? file.length : file.size
  if (fileSize > MAX_FILE_SIZE) {
    const sizeMB = (fileSize / 1024 / 1024).toFixed(2)
    return { url: null, error: `File size (${sizeMB}MB) exceeds the maximum of 10MB.` }
  }

  const suffix = crypto.randomBytes(6).toString("hex")
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  const storagePath = `${folder}/${suffix}-${safeName}`

  const adminClient = createAdminSupabaseClient()
  const fileBody = isBuffer ? file : Buffer.from(await file.arrayBuffer())

  const { error } = await adminClient.storage.from(BUCKET).upload(storagePath, fileBody, {
    contentType,
    upsert: false,
  })

  if (error) {
    console.error("[storage] Upload failed:", error)
    return { url: null, error: `Upload failed: ${error.message}` }
  }

  return { url: getPublicUrl(storagePath), error: null }
}
