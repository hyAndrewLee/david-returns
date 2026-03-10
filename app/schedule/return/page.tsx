"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function PaymentReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [isMembership, setIsMembership] = useState(false)

  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id")

        if (!sessionId) {
          setStatus("error")
          setMessage("Invalid payment session")
          return
        }

        const checkResponse = await fetch(`/api/checkout-session?session_id=${sessionId}`)
        const sessionData = await checkResponse.json()

        if (!checkResponse.ok) {
          setStatus("error")
          setMessage("Failed to verify payment")
          return
        }

        if (sessionData.mode === "subscription") {
          setIsMembership(true)

          const response = await fetch("/api/activate-membership", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })

          const data = await response.json()

          if (response.ok) {
            setStatus("success")
            setMessage(data.message || "Membership activated!")
          } else {
            setStatus("error")
            setMessage(data.error || "Failed to activate membership")
          }
        } else {
          setIsMembership(false)
          setStatus("success")
          setMessage("Payment successful! Your pickup has been scheduled.")
        }

        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (error) {
        console.error("Error processing payment:", error)
        setStatus("error")
        setMessage("Something went wrong. Please contact support.")
      }
    }

    processPayment()
  }, [searchParams, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Processing your payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full text-center p-8 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-600 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-3">Payment Successful!</h1>
          <p className="text-green-700 mb-6">{message}</p>
          {isMembership && (
            <div className="rounded-lg bg-white/60 border border-green-200 p-4 mb-6">
              <p className="text-sm text-green-800">
                Your unlimited membership is now active. All future pickups are free!
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full text-center p-8 rounded-xl border-2 border-red-200 bg-red-50 shadow-xl">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-900 mb-3">Something went wrong</h1>
        <p className="text-red-700 mb-6">{message}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
