"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const ResetPasswordPage = () => {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Please enter a new password")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
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
          {success ? (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">Password updated</h1>
              <p className="mt-3 text-center text-muted-foreground">
                Your password has been reset. Redirecting to dashboard...
              </p>
            </>
          ) : (
            <>
              <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">Set new password</h1>
              <p className="mt-3 text-center text-muted-foreground">Enter your new password below</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
                )}

                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    New Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
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

                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    "Updating..."
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/signin" className="font-medium text-foreground hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default ResetPasswordPage
