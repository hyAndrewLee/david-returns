"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"

const ConfirmedPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(true)

  const status = searchParams.get("status")
  const reason = searchParams.get("reason")
  const debugId = searchParams.get("debug_id")
  const error = searchParams.get("error")
  const shouldContinue = searchParams.get("continue")

  useEffect(() => {
    const processConfirmation = async () => {
      if (status === "success" && shouldContinue === "true") {
        const supabase = createBrowserSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Check for pending address
          const pendingAddress = localStorage.getItem("pendingAddress")
          if (pendingAddress) {
            try {
              const addressData = JSON.parse(pendingAddress)

              await supabase.from("profiles").upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: addressData.fullName,
                phone: addressData.phone,
              })

              await supabase.from("addresses").insert({
                user_id: session.user.id,
                label: "Home",
                full_name: addressData.fullName,
                phone: addressData.phone,
                street_address: addressData.streetAddress,
                apt: addressData.apt || null,
                city: addressData.city,
                zip: addressData.zip,
                is_default: true,
              })

              localStorage.removeItem("pendingAddress")
            } catch (err) {
              console.error("Error saving pending data:", err)
            }
          }

          await supabase.auth.signOut()
        }

        setTimeout(() => {
          router.push("/signin?confirmed=true")
        }, 2000)
      }
      setProcessing(false)
    }

    processConfirmation()
  }, [status, shouldContinue, router])

  return (
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

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Email Confirmed!</h1>
              <p className="mt-2 text-muted-foreground">
                {processing ? "Setting up your account..." : "Redirecting to sign in..."}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Confirmation Failed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {error || "Email confirmation failed. Please try signing up again."}
              </p>

              <div className="mt-6 rounded-lg bg-muted p-4 text-left">
                <p className="text-xs font-mono text-muted-foreground mb-2">Debug Information:</p>
                <div className="space-y-1 text-xs font-mono">
                  <p>
                    Status: <span className="text-red-600">{status}</span>
                  </p>
                  <p>
                    Reason: <span className="text-foreground">{reason}</span>
                  </p>
                  <p>
                    Debug ID: <span className="text-foreground">{debugId}</span>
                  </p>
                </div>
              </div>

              <Link
                href="/signup"
                className="mt-6 inline-block rounded-lg bg-foreground px-6 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Try Again
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

const ConfirmedPage = () => (
  <Suspense
    fallback={
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </main>
    }
  >
    <ConfirmedPageContent />
  </Suspense>
)

export default ConfirmedPage
