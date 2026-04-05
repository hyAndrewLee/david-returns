import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "@/server/trpc/router"
import { createTRPCContext } from "@/server/trpc/init"
import { createLogger } from "@/lib/logger"

const log = createLogger("trpc-handler")

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError: ({ path, error, type }) => {
      log.error({ path, type, code: error.code, message: error.message }, `tRPC error on ${path}`)
    },
  })

export { handler as GET, handler as POST }
