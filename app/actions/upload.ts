"use server"

import { uploadToStorage } from "@/lib/supabase/storage"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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

    const base64Data = fileData.base64.split(",")[1] || fileData.base64
    const buffer = Buffer.from(base64Data, "base64")

    return await uploadToStorage(buffer, fileData.name, fileData.type, "labels")
  } catch (error) {
    console.error("Upload failed:", error)
    return {
      url: null,
      error: error instanceof Error ? `Upload failed: ${error.message}` : "An unexpected error occurred during upload.",
    }
  }
}

export const uploadFile = async (file: File): Promise<{
  url: string | null
  error: string | null
}> => {
  try {
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      return {
        url: null,
        error: `File size (${fileSizeMB}MB) exceeds the maximum allowed size of 5MB.`,
      }
    }

    return await uploadToStorage(file, file.name, file.type, "labels")
  } catch (error) {
    console.error("Upload failed:", error)
    return {
      url: null,
      error: error instanceof Error ? error.message : "Upload failed. Please try again.",
    }
  }
}
