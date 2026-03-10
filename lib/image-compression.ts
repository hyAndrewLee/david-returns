export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function readFileToMemory(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: file.type })
      const freshFile = new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      })
      console.log("[v0] File read into memory:", freshFile.name, (freshFile.size / 1024 / 1024).toFixed(2) + "MB")
      resolve(freshFile)
    }
    reader.readAsArrayBuffer(file)
  })
}

export async function compressImage(file: File, maxSizeMB = 4): Promise<File> {
  return new Promise(async (resolve, reject) => {
    console.log(
      "[v0] Starting compression for:",
      file.name,
      "Type:",
      file.type,
      "Size:",
      (file.size / 1024 / 1024).toFixed(2) + "MB",
    )

    try {
      let fileToProcess = file

      const isHEIC = file.type === "image/heic" || file.type === "image/heif" || /\.(heic|heif)$/i.test(file.name)

      if (isHEIC) {
        console.log("[v0] Detected HEIF/HEIC file, converting to JPEG...")
        try {
          const heic2any = (await import("heic2any")).default

          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          })

          // heic2any can return Blob or Blob[], handle both cases
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob

          fileToProcess = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          })

          console.log(
            "[v0] HEIF converted to JPEG:",
            fileToProcess.name,
            (fileToProcess.size / 1024 / 1024).toFixed(2) + "MB",
          )
        } catch (heicError) {
          console.error("[v0] HEIF conversion failed:", heicError)
          reject(
            new Error(
              "Unable to process iPhone photo (HEIF format). Please take a screenshot of the photo and upload that instead.",
            ),
          )
          return
        }
      }

      // If file is already small enough after conversion, read into memory to prevent stale reference
      if (fileToProcess.size <= maxSizeMB * 1024 * 1024) {
        console.log("[v0] File is already under size limit, reading into memory to prevent stale reference...")
        try {
          const freshFile = await readFileToMemory(fileToProcess)
          console.log("[v0] File ready for upload:", freshFile.name)
          resolve(freshFile)
        } catch (readError) {
          console.error("[v0] Failed to read file into memory:", readError)
          // Fallback to original file if memory read fails
          resolve(fileToProcess)
        }
        return
      }

      const reader = new FileReader()

      reader.onerror = () => {
        console.error("[v0] FileReader error for:", fileToProcess.name)
        reject(new Error(`Failed to read file: ${fileToProcess.name}. This may be an unsupported format.`))
      }

      reader.onload = (event) => {
        console.log("[v0] File loaded into FileReader, creating image...")
        const img = new Image()
        img.src = event.target?.result as string

        img.onerror = () => {
          console.error("[v0] Image load error for:", fileToProcess.name, "Type:", fileToProcess.type)
          reject(new Error(`Unable to process image: ${fileToProcess.name}. Please try a different file format.`))
        }

        img.onload = () => {
          console.log("[v0] Image loaded successfully, dimensions:", img.width, "x", img.height)
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1920 // Max width or height
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }

          console.log("[v0] Resizing to:", width, "x", height)
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to get canvas context"))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)

          // Start with quality 0.8 and reduce if needed
          let quality = 0.8
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to compress image"))
                  return
                }

                console.log("[v0] Compressed to:", (blob.size / 1024 / 1024).toFixed(2) + "MB", "at quality:", quality)

                // If still too large and quality can be reduced, try again
                if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
                  quality -= 0.1
                  tryCompress()
                  return
                }

                const originalName = fileToProcess.name
                const newName = originalName.replace(/\.(heic|heif|png|jpeg)$/i, ".jpg")

                const compressedFile = new File([blob], newName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })

                console.log("[v0] Compression complete. Final file:", compressedFile.name, compressedFile.size, "bytes")
                resolve(compressedFile)
              },
              "image/jpeg",
              quality,
            )
          }

          tryCompress()
        }
      }

      console.log("[v0] Reading file as DataURL...")
      reader.readAsDataURL(fileToProcess)
    } catch (error) {
      console.error("[v0] Compression error:", error)
      reject(error)
    }
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / 1024 / 1024).toFixed(2) + " MB"
}
