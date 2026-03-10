"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const SignInPage = () => {
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
      const supabase = createClient()
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
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
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

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">Welcome back</h1>

          <p className="mt-3 text-center text-muted-foreground">Sign in to manage your returns</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {successMessage && (
              <div className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">{successMessage}</div>
            )}

            {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

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

            <div className="relative">
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground hover:underline">
              Create account
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

export default SignInPage
