import { TRPCError } from "@trpc/server"
import { baseProcedure } from "./init"
import { adminDb } from "@/server/db"
import { profiles } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

export const authedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  })
})

export const adminProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (adminSession?.value === "authenticated") {
    return next({ ctx })
  }

  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  const [profile] = await adminDb
    .select({ isAdmin: profiles.isAdmin })
    .from(profiles)
    .where(eq(profiles.id, ctx.session.user.id))
    .limit(1)

  if (!profile?.isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" })
  }

  return next({ ctx })
})
