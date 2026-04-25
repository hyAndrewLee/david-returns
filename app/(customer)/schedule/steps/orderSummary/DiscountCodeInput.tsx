"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const DiscountCodeInput = () => {
  const { discountCode, setDiscountCode, applyDiscountCode } = useSchedule()

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyDiscountCode()}
        placeholder="Enter code"
        className="flex-1 rounded-[0.375rem] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <button
        onClick={applyDiscountCode}
        className="rounded-[0.375rem] bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
      >
        Apply
      </button>
    </div>
  )
}
