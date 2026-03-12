"use client"

import { createTRPCReact } from "@trpc/react-query"
import { httpBatchLink } from "@trpc/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import superjson from "superjson"
import type { AppRouter } from "@/server/trpc/router"

export const trpc = createTRPCReact<AppRouter>()

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL
  return "http://localhost:3000"
}

export const TRPCProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
