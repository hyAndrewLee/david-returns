import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Page Not Found | David Returns",
  description: "The page you're looking for doesn't exist or has been moved.",
}

const NotFoundPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
    <div className="w-full max-w-md text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent-warm">404</p>
      <h1 className="mt-4 font-display text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
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

export default NotFoundPage
