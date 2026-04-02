"use client"

import type React from "react"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Eye, EyeOff, Building2, Package, MapPin } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase"

const INPUT_CLASS =
  "w-full rounded-[0.375rem] border border-[rgba(26,26,46,0.15)] bg-surface-container-lowest px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-[rgba(26,26,46,0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(26,26,46,0.06)] transition-all"

const trustSignals = [
  { icon: Building2, text: "Partnered with buildings across NYC" },
  { icon: Package, text: "Thousands of packages processed" },
  { icon: MapPin, text: "Serving Manhattan & Brooklyn" },
]

const SignInPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      setSuccessMessage("Email confirmed! You can now sign in.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createBrowserSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Sign in error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden w-1/2 bg-surface-dark p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/">
          <Image
            src="/images/david-returns-logo.png"
            alt="David Returns"
            width={160}
            height={40}
            className="h-10 w-auto brightness-0 invert"
            priority
          />
        </Link>

        <div>
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.02em] text-[#f9f9f6] xl:text-5xl">
            Returns, simplified.
          </h2>
          <p className="mt-4 max-w-sm text-lg text-[rgba(249,249,246,0.6)]">
            Schedule a pickup and we handle the rest. No boxes, no lines, no effort.
          </p>

          <div className="mt-10 space-y-4">
            {trustSignals.map((signal) => (
              <div key={signal.text} className="flex items-center gap-3 text-[rgba(249,249,246,0.45)]">
                <signal.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <span className="text-sm">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-[rgba(249,249,246,0.3)]">
          &copy; {new Date().getFullYear()} David Returns
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-surface px-4 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center justify-center lg:hidden">
            <Image
              src="/images/david-returns-logo.png"
              alt="David Returns"
              width={180}
              height={45}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <h1 className="font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
            Welcome back
          </h1>
          <p className="mt-3 text-muted-foreground">Sign in to manage your returns</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {successMessage && (
              <div className="rounded-[0.375rem] bg-accent-green-light px-4 py-3 text-sm text-accent-green">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="rounded-[0.375rem] bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${INPUT_CLASS} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-[0.375rem] bg-primary py-3.5 text-sm font-medium text-on-primary transition-all hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)] disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground hover:underline">
              Create account
            </Link>
          </p>

          <p className="mt-8 text-center text-sm text-muted-foreground lg:hidden">
            <Link href="/" className="hover:text-foreground transition-colors">
              &larr; Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

const SignInPage = () => (
  <Suspense fallback={
    <main className="flex min-h-screen items-center justify-center bg-surface">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
    </main>
  }>
    <SignInPageContent />
  </Suspense>
)

export default SignInPage
