"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { signUpAction } from "@/app/actions/auth"

const SignUpPage = () => {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [apt, setApt] = useState("")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName) {
      setError("Please enter your first and last name")
      return
    }

    if (!email) {
      setError("Please enter your email")
      return
    }

    if (!phone) {
      setError("Please enter your phone number")
      return
    }

    if (!streetAddress) {
      setError("Please enter your street address")
      return
    }

    if (!city) {
      setError("Please enter your city")
      return
    }

    if (!zip) {
      setError("Please enter your ZIP code")
      return
    }

    if (!password) {
      setError("Please enter a password")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const addressData = {
        streetAddress,
        apt,
        city,
        zip,
        fullName: `${firstName} ${lastName}`,
        phone,
      }

      localStorage.setItem("pendingAddress", JSON.stringify(addressData))

      const result = await signUpAction({
        email,
        password,
        firstName,
        lastName,
        phone,
        streetAddress,
        apt,
        city,
        zip,
      })

      if (result.error) {
        console.error("[v0] Signup error:", result.error)

        if (result.error.includes("Error sending confirmation email") || result.error.includes("email")) {
          setError(
            "Unable to send confirmation email. Please check your email address and try again, or contact support at hello@davidreturns.com",
          )
        } else if (result.error.includes("already registered") || result.error.includes("already exists")) {
          setError("An account with this email already exists. Please sign in instead.")
        } else {
          setError(result.error)
        }
        setIsLoading(false)
        return
      }

      if (result.success) {
        setShowEmailConfirmation(true)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (showEmailConfirmation) {
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
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>

            <p className="mt-3 text-muted-foreground">
              We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Click the link in your email to activate your account, then you can sign in.
            </p>

            <div className="mt-8 space-y-3">
              <Link
                href="/signin"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-medium text-background transition-all hover:opacity-90"
              >
                Go to Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={() => setShowEmailConfirmation(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to sign up
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

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
          <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Returns made <span className="text-orange-500 italic">simple</span>.
          </h1>

          <p className="mt-3 text-center text-muted-foreground">
            You're one step away from never standing in line again.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
                {error.includes("already exists") && (
                  <Link href="/signin" className="ml-1 font-medium underline">
                    Sign in here
                  </Link>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">We'll text you status updates about your returns</p>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium text-foreground mb-3">Pickup Address</p>

              <div className="space-y-3">
                <input
                  id="streetAddress"
                  type="text"
                  placeholder="Street address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />

                <input
                  id="apt"
                  type="text"
                  placeholder="Apt, suite, unit (optional)"
                  value={apt}
                  onChange={(e) => setApt(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                  <input
                    id="zip"
                    type="text"
                    placeholder="ZIP code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">This will be your default pickup address</p>
            </div>

            <div className="relative pt-2">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 pr-12 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <a href="/terms" className="text-foreground underline underline-offset-2 hover:no-underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-foreground underline underline-offset-2 hover:no-underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                "Creating account..."
              ) : (
                <>
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}

export default SignUpPage
