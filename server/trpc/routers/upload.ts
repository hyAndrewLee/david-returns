import { z } from "zod"
import { createTRPCRouter } from "../init"
import { authedProcedure, adminProcedure } from "../middlewares"
import { uploadToStorage } from "@/server/services/storage"
import { adminDb } from "@/server/db"
import { orders } from "@/server/db/schema"
import { eq } from "drizzle-orm"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export const uploadRouter = createTRPCRouter({
  uploadLabel: authedProcedure
    .input(
      z.object({
        base64: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.size > MAX_FILE_SIZE) {
        const fileSizeMB = (input.size / 1024 / 1024).toFixed(2)
        const isPDF = input.type === "application/pdf"

        return {
          url: null,
          error: isPDF
            ? `PDF file size (${fileSizeMB}MB) exceeds the maximum allowed size of 5MB.`
            : `File size (${fileSizeMB}MB) exceeds the maximum allowed size of 5MB.`,
        }
      }

      const base64Data = input.base64.split(",")[1] || input.base64
      const buffer = Buffer.from(base64Data, "base64")

      return await uploadToStorage(buffer, input.name, input.type, "labels")
    }),

  uploadProof: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        type: z.enum(["pickup", "delivery", "return"]),
        base64: z.string(),
        name: z.string(),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const base64Data = input.base64.split(",")[1] || input.base64
      const buffer = Buffer.from(base64Data, "base64")

      const result = await uploadToStorage(buffer, `${input.type}-${Date.now()}.jpg`, input.contentType, `proofs/${input.orderId}`)

      if (result.error || !result.url) {
        throw new Error(result.error || "Upload failed")
      }

      const updateData: Record<string, string> = {
        updatedAt: new Date().toISOString(),
      }

      if (input.type === "pickup") updateData.proofPickupUrl = result.url
      else if (input.type === "delivery") updateData.proofDeliveryUrl = result.url
      else if (input.type === "return") updateData.proofReturnUrl = result.url

      await adminDb.update(orders).set(updateData).where(eq(orders.id, input.orderId))

      return { url: result.url }
    }),
})
