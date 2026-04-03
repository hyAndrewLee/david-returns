import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Confirmation Failed | David Returns",
  description: "Email confirmation failed. Please try signing in or signing up again.",
}

const CallbackErrorPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
    <div className="w-full max-w-md">
      <Link href="/" className="mb-8 flex items-center justify-center">
        <Image
          src="/images/david-returns-logo.png"
          alt="David Returns"
          width={180}
          height={45}
          className="h-12 w-auto"
          priority
        />
      </Link>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">Confirmation Failed</h1>
        <p className="mt-2 text-muted-foreground">
          Email confirmation failed. Please try signing in or signing up again.
        </p>
        <Link
          href="/signin"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  </main>
)

export default CallbackErrorPage
