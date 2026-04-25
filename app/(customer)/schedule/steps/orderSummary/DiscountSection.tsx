"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { DiscountAppliedBadge } from "@/app/(customer)/schedule/steps/orderSummary/DiscountAppliedBadge"
import { DiscountCodeInput } from "@/app/(customer)/schedule/steps/orderSummary/DiscountCodeInput"

export const DiscountSection = () => {
  const { discountApplied, showDiscountInput, setShowDiscountInput } = useSchedule()

  if (discountApplied) return <DiscountAppliedBadge />

  if (showDiscountInput) return <DiscountCodeInput />

  return (
    <button
      onClick={() => setShowDiscountInput(true)}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Have a discount code?
    </button>
  )
}
