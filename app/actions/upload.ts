"use server"

import { put } from "@vercel/blob"
import { headers } from "next/headers"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

export const uploadLabelFile = async (fileData: {
  base64: string
  name: string
  type: string
  size: number
}) => {
  try {
    if (fileData.size > MAX_FILE_SIZE) {
      const fileSizeMB = (fileData.size / 1024 / 1024).toFixed(2)
      const isPDF = fileData.type === "application/pdf"

      if (isPDF) {
        return {
          url: null,
          error: `PDF file size (${fileSizeMB}MB) exceeds the maximum allowed size of 5MB. Please reduce the PDF size or take a screenshot of the label instead.`,
        }
      }

      return {
        url: null,
        error: `File size (${fileSizeMB}MB) exceeds the maximum allowed size of 5MB. Please compress the image or choose a smaller file.`,
      }
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return {
        url: null,
        error: "Upload configuration error: Storage token is missing. Please contact support.",
      }
    }

    try {
      const base64Data = fileData.base64.split(",")[1] || fileData.base64
      const binaryString = Buffer.from(base64Data, "base64")

      const blob = await put(fileData.name, binaryString, {
        access: "public",
        addRandomSuffix: true,
        contentType: fileData.type,
      })

      return { url: blob.url, error: null }
    } catch (blobError: unknown) {
      const message = blobError instanceof Error ? blobError.message : "Unknown error"

      if (message.includes("401") || message.includes("403")) {
        return {
          url: null,
          error: "Upload authentication failed. Please contact support to resolve storage configuration.",
        }
      }

      if (message.includes("400")) {
        return {
          url: null,
          error: "Upload request was rejected. This may be a file format issue. Please try using a PDF instead.",
        }
      }

      return {
        url: null,
        error: `Upload failed: ${message}. Try using a PDF file instead.`,
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        url: null,
        error: `Upload failed: ${error.message}. Please try again or use a PDF file instead.`,
      }
    }

    return {
      url: null,
      error: "An unexpected error occurred during upload. Please try using a PDF file instead.",
    }
  }
}

export const uploadFileViaAPI = async (file: File): Promise<{
  url: string | null
  error: string | null
  debug?: {
    status: number | null
    contentType: string | null
    rawResponse: string | null
    fetchError?: string
  }
}> => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const h = await headers()
    const proto = h.get("x-forwarded-proto") ?? "http"
    const host = h.get("x-forwarded-host") ?? h.get("host")
    const uploadUrl = `${proto}://${host}/api/upload-label`

    let response: Response
    try {
      response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })
    } catch (fetchError) {
      return {
        url: null,
        error: "FETCH_FAILED: " + (fetchError instanceof Error ? fetchError.message : String(fetchError)),
        debug: {
          status: null,
          contentType: null,
          rawResponse: null,
          fetchError: String(fetchError),
        },
      }
    }

    const status = response.status
    const contentType = response.headers.get("content-type")
    const rawResponse = await response.text()

    let data: { url?: string; error?: string }
    try {
      data = JSON.parse(rawResponse)
    } catch (parseError) {
      return {
        url: null,
        error: "Server returned invalid JSON response",
        debug: { status, contentType, rawResponse: rawResponse.substring(0, 500) },
      }
    }

    if (!response.ok) {
      return {
        url: null,
        error: data.error || `Upload failed with status ${status}`,
        debug: { status, contentType, rawResponse: rawResponse.substring(0, 500) },
      }
    }

    if (!data.url) {
      return {
        url: null,
        error: "Upload succeeded but no URL returned.",
        debug: { status, contentType, rawResponse: rawResponse.substring(0, 500) },
      }
    }

    return {
      url: data.url,
      error: null,
      debug: { status, contentType, rawResponse: "Success" },
    }
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : "Upload failed. Please try again.",
      debug: { status: null, contentType: null, rawResponse: null, fetchError: String(error) },
    }
  }
}
