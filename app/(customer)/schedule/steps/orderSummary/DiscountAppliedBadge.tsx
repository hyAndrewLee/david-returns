"use client"

import { Tag, X } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const DiscountAppliedBadge = () => {
  const { discountCode, removeDiscountCode } = useSchedule()

  return (
    <div className="flex items-center justify-between rounded-[0.375rem] bg-emerald-50 border border-emerald-200 px-3 py-2">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">{discountCode.toUpperCase()}</span>
      </div>
      <button
        onClick={removeDiscountCode}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
