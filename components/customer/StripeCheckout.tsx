"use client"

import { useEffect, useState, useRef } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { trpc } from "@/lib/trpc"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
const clientStripeMode = pubKey.startsWith("pk_live_") ? "LIVE" : pubKey.startsWith("pk_test_") ? "TEST" : "UNKNOWN"
console.log("[v0] Client-side Stripe mode:", clientStripeMode, "- Key prefix:", pubKey.substring(0, 15))

type StripeCheckoutProps = {
  plan: "Pay-As-You-Go" | "Membership"
  itemCount: number
  isInstant: boolean
  pickupDate: string
  pickupTime: string
  pickupMethod: string
  address: {
    fullName: string
    phone: string
    street: string
    apt?: string
    city: string
    zip: string
    notes?: string
    pickupInstructions?: string
  }
  items: Array<{
    labelType: string
    description: string
    retailer?: string
    packageSize?: string
    isBoxed?: boolean
    returnTo?: string
    returnToOther?: string
    labelFileUrl?: string
    photoUrl?: string
  }>
  clientSecret?: string | null
}

const StripeCheckout = ({
  plan,
  itemCount,
  isInstant,
  pickupDate,
  pickupTime,
  pickupMethod,
  address,
  items,
  clientSecret: propClientSecret,
}: StripeCheckoutProps) => {
  const router = useRouter()
  const [isFree, setIsFree] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState<string | null>(propClientSecret || null)
  const [error, setError] = useState<string | null>(null)
  const sessionCreatedRef = useRef(false)
  const checkoutMutation = trpc.stripe.createCheckout.useMutation()

  useEffect(() => {
    if (propClientSecret) {
      setClientSecret(propClientSecret)
      setIsLoading(false)
      return
    }

    // Prevent duplicate session creation (React Strict Mode or re-renders)
    if (sessionCreatedRef.current) {
      console.log("[v0] Session already being created, skipping duplicate call")
      return
    }

    const checkPaymentStatus = async () => {
      // Double-check the ref in case of race conditions
      if (sessionCreatedRef.current) {
        console.log("[v0] Session creation already in progress, aborting")
        return
      }
      
      sessionCreatedRef.current = true
      console.log("[v0] Creating checkout session...")
      
      try {
        setIsLoading(true)
        setError(null)

        const result = await checkoutMutation.mutateAsync({
          plan,
          itemCount,
          isInstant,
          pickupDate,
          pickupTime,
          pickupMethod,
          address,
          items,
        })

        if (!result.success) {
          setError(result.error || "Failed to create checkout session")
          setIsLoading(false)
          return
        }

        if (result.free) {
          setIsFree(true)
          setIsLoading(false)
          return
        }

        if (result.clientSecret) {
          console.log("[v0] Checkout session created successfully")
          setClientSecret(result.clientSecret)
          setIsLoading(false)
          return
        }

        throw new Error("Invalid checkout session response")
      } catch (err) {
        let errorMessage = "Failed to create checkout session. Please try again."

        if (err instanceof Error) {
          if (err.message.includes("Authentication") || err.message.includes("sign in")) {
            errorMessage = "Please sign in to continue with checkout."
          } else if (err.message.includes("database") || err.message.includes("connect")) {
            errorMessage = "Unable to connect. Please check your internet and try again."
          } else {
            errorMessage = err.message
          }
        }

        setError(errorMessage)
        setIsLoading(false)
        sessionCreatedRef.current = false // Reset on error to allow retry
      }
    }

    checkPaymentStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount - all data should be ready when component mounts

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground"></div>
        <p className="text-sm text-muted-foreground">Preparing checkout...</p>
      </div>
    )
  }

  if (isFree) {
    return (
      <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 shadow-lg">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">Pickup Scheduled Successfully!</h3>
        <p className="text-green-700 mb-4">
          Thank you for being a loyal member! This pickup is completely free with your unlimited membership.
        </p>
        <div className="rounded-lg bg-white/60 border border-green-200 p-4 mb-6 text-left">
          <p className="text-sm text-green-800">
            <strong>No payment required.</strong> Your membership automatically covers all pickups. Simply schedule as
            many returns as you need!
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-green-600 px-8 py-3 text-sm font-medium text-white hover:bg-green-700 shadow-md transition-all"
        >
          View My Orders
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">Unable to initialize checkout. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout" className="rounded-xl overflow-hidden">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          clientSecret,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export default StripeCheckout
