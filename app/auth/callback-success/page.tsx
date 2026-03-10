"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"

export default function CallbackSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"processing" | "success">("processing")

  useEffect(() => {
    const processCallback = async () => {
      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Check for pending address
        const pendingAddress = localStorage.getItem("pendingAddress")
        if (pendingAddress) {
          try {
            const addressData = JSON.parse(pendingAddress)

            // Update profile
            await supabase.from("profiles").upsert({
              id: session.user.id,
              email: session.user.email,
              full_name: addressData.fullName,
              phone: addressData.phone,
            })

            // Save address
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
            console.error("[v0] Error saving pending data:", err)
          }
        }

        // Sign out and redirect to login
        await supabase.auth.signOut()
        setStatus("success")

        setTimeout(() => {
          router.push("/signin?confirmed=true")
        }, 2000)
      } else {
        router.push("/signin?confirmed=true")
      }
    }

    processCallback()
  }, [router])

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

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10 text-center">
          {status === "processing" && (
            <>
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
              <p className="text-muted-foreground">Confirming your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Email Confirmed!</h1>
              <p className="mt-2 text-muted-foreground">Your email has been confirmed. Please sign in to continue.</p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
