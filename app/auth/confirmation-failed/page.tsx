import Link from "next/link"
import { Suspense } from "react"

function ConfirmationFailedContent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Confirmation Failed</h1>
          <p className="text-muted-foreground">
            Email confirmation failed. Please try signing up again or contact support.
          </p>
        </div>

        <Link
          href="/signup"
          className="block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to Sign Up
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationFailedContent />
    </Suspense>
  )
}
