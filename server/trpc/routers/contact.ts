import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../init"
import { sendContactForm } from "@/server/services/email"

export const contactRouter = createTRPCRouter({
  send: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        subject: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await sendContactForm(input)
      return { success: true, emailId: data?.id }
    }),
})
