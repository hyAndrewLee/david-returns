"use client"

import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const ScheduleSuccess = () => {
  const { formData } = useSchedule()

  const formattedDate = (() => {
    const [year, month, day] = formData.selectedDate.split("-").map(Number)
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  })()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </div>
        <h1 className="font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
          You're all set!
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">We'll confirm your pickup by text shortly.</p>

        <div className="mt-8 rounded-[0.375rem] bg-surface-container-lowest p-6 text-left shadow-[0_4px_24px_rgba(26,28,27,0.06)]">
          <h3 className="font-medium text-foreground">Pickup details</h3>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Date:</span> {formattedDate}
            </p>
            <p>
              <span className="text-foreground font-medium">Time:</span> {formData.timeWindow}
            </p>
            <p>
              <span className="text-foreground font-medium">Items:</span> {formData.items.length} package
              {formData.items.length > 1 ? "s" : ""}
            </p>
            {formData.isInstant && (
              <p className="flex items-center gap-1.5 text-orange-600">
                <Zap className="h-4 w-4" /> Instant pickup
              </p>
            )}
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-[0.375rem] bg-primary px-7 py-3.5 text-sm font-medium text-on-primary transition-all hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)]"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
