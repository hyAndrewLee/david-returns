import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Check Your Email | David Returns",
  description: "A confirmation email has been sent. Please verify your email to activate your account.",
}

const SignUpSuccessPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
    <div className="w-full max-w-md">
      <Link href="/" className="mb-12 flex items-center justify-center">
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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Mail className="h-8 w-8 text-orange-500" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Check your email</h1>

        <p className="mt-3 text-muted-foreground">
          We've sent you a confirmation link. Please check your email to verify your account.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Once verified, you'll be taken to your dashboard where you can submit returns.
        </p>

        <Link
          href="/signin"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  </main>
)

export default SignUpSuccessPage
