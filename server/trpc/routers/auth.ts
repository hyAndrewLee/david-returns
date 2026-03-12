import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../init"
import { authedProcedure } from "../middlewares"
import { createServerSupabaseClient } from "@/server/auth/supabase"
import { adminDb } from "@/server/db"
import { profiles } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        streetAddress: z.string(),
        apt: z.string().optional(),
        city: z.string(),
        zip: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createServerSupabaseClient()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: `${input.firstName} ${input.lastName}`,
            phone: input.phone,
            street_address: input.streetAddress,
            apt: input.apt,
            city: input.city,
            zip: input.zip,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_URL || "https://www.davidreturns.com"}/auth/callback`,
        },
      })

      if (authError) {
        return { error: authError.message }
      }

      if (authData.user) {
        return {
          success: true,
          addressData: {
            streetAddress: input.streetAddress,
            apt: input.apt,
            city: input.city,
            zip: input.zip,
            fullName: `${input.firstName} ${input.lastName}`,
            phone: input.phone,
            userId: authData.user.id,
          },
        }
      }

      return { success: true }
    }),

  getProfile: authedProcedure.query(async ({ ctx }) => {
    const [profile] = await adminDb
      .select()
      .from(profiles)
      .where(eq(profiles.id, ctx.user.id))
      .limit(1)

    return profile ?? null
  }),

  checkAdmin: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const [profile] = await adminDb
        .select({ isAdmin: profiles.isAdmin })
        .from(profiles)
        .where(eq(profiles.id, input.userId))
        .limit(1)

      return { isAdmin: profile?.isAdmin === true }
    }),
})
