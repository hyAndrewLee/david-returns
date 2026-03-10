"use client"

import { Check, Sparkles } from "lucide-react"
import { useSchedule } from "@/app/schedule/ScheduleContext"

export const PlanStep = () => {
  const { formData, setFormData, isMember, setCurrentStep } = useSchedule()

  if (isMember) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">You're all set!</h2>
          <p className="text-muted-foreground mb-6">
            Your unlimited membership covers this pickup at no additional cost.
          </p>
          <button
            onClick={() => setCurrentStep(5)}
            className="rounded-full bg-green-600 px-8 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            Continue to items
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Choose your plan</h1>
        <p className="mt-2 text-muted-foreground">Select the option that works best for you.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setFormData((prev) => ({ ...prev, plan: "Pay-As-You-Go" }))}
          className={`relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all ${
            formData.plan === "Pay-As-You-Go"
              ? "border-foreground bg-card shadow-lg"
              : "border-border bg-card hover:border-muted-foreground hover:shadow-md"
          }`}
        >
          {formData.plan === "Pay-As-You-Go" && (
            <div className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
              <Check className="h-4 w-4" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground">One-time pickup</h3>
          <div className="mt-3">
            <span className="text-3xl font-bold text-foreground">$5</span>
            <span className="text-muted-foreground"> per pickup</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">+ $2 per additional package</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Free label printing
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Free shipping boxes
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> No per-pickup fees
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" /> Cancel anytime
            </li>
          </ul>
        </button>

        <button
          onClick={() => setFormData((prev) => ({ ...prev, plan: "Membership" }))}
          className={`relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all ${
            formData.plan === "Membership"
              ? "border-orange-500 bg-card shadow-lg ring-2 ring-orange-500/20"
              : "border-border bg-card hover:border-muted-foreground hover:shadow-md"
          }`}
        >
          <span className="absolute -top-3 left-4 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-medium text-white">
            Best value
          </span>
          {formData.plan === "Membership" && (
            <div className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
              <Check className="h-4 w-4" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground">Unlimited</h3>
          <div className="mt-3">
            <span className="text-3xl font-bold text-foreground">$14.99</span>
            <span className="text-muted-foreground"> / month</span>
          </div>
          <p className="mt-1 text-sm text-orange-600 font-medium">Unlimited pickups & packages</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Free label printing
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Free shipping boxes
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Priority scheduling
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" /> Cancel anytime
            </li>
          </ul>
        </button>
      </div>
    </div>
  )
}
