import { z } from "zod"
import { createTRPCRouter } from "../init"
import { authedProcedure } from "../middlewares"
import { uploadToStorage } from "@/server/services/storage"

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

})
