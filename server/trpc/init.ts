import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { createServerSupabaseClient } from "@/server/auth/supabase"
import { createDrizzleSupabaseClient } from "@/server/db"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createServerSupabaseClient()

  // Authenticate with the Supabase Auth server — never trust cookies alone.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only fetch the session for its access token after we've verified the user.
  // Reading `session.access_token` (not `session.user`) does not trigger the
  // insecure-session warning.
  let accessToken: string | undefined
  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    accessToken = session?.access_token
  }

  const db = await createDrizzleSupabaseClient(accessToken)

  return {
    db,
    user,
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
