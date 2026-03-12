import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { createServerSupabaseClient } from "@/server/auth/supabase"
import { createDrizzleSupabaseClient } from "@/server/db"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const db = await createDrizzleSupabaseClient(session?.access_token)

  return {
    db,
    session,
    supabase,
    ...opts,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure
export const baseProcedure = t.procedure
