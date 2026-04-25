"use client"

import { Sparkles } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const UpgradeBanner = () => {
  const { formData, calculateTotal, setFormData } = useSchedule()
  const total = calculateTotal()

  if (formData.plan !== "Pay-As-You-Go" || total.isExistingMember) return null

  return (
    <div className="mt-6 rounded-[0.375rem] bg-copper-light p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-copper mt-0.5" />
        <div>
          <p className="font-medium text-foreground text-sm">Save with Unlimited</p>
          <p className="text-xs text-muted-foreground mt-0.5">Get unlimited pickups for just $22.99/mo</p>
          <button
            onClick={() => setFormData((prev) => ({ ...prev, plan: "Membership" }))}
            className="text-xs font-medium text-copper hover:text-foreground mt-2 transition-colors"
          >
            Upgrade now →
          </button>
        </div>
      </div>
    </div>
  )
}
