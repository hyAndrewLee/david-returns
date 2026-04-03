"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-destructive">Error</p>
        <h1 className="mt-4 font-display text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-[0.375rem] border border-[rgba(26,26,46,0.15)] bg-surface-container-lowest px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-surface-container-low"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-[0.375rem] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-all hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}

export default ErrorPage
