"use client"

import { Zap } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { PriceRow } from "@/app/(customer)/schedule/steps/orderSummary/PriceRow"
import { TotalRow } from "@/app/(customer)/schedule/steps/orderSummary/TotalRow"

export const MemberPricingLines = () => {
  const { formData } = useSchedule()

  return (
    <>
      <PriceRow
        label={<span className="text-muted-foreground">Unlimited membership</span>}
        value={<span className="text-emerald-600 font-medium">Active</span>}
      />
      <PriceRow
        label={<span className="text-muted-foreground">This pickup</span>}
        value={<span className="text-emerald-600 font-medium">FREE</span>}
      />
      {formData.isInstant && (
        <PriceRow
          label={
            <span className="text-orange-600 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Instant pickup
            </span>
          }
          value={<span className="text-emerald-600 font-medium">FREE</span>}
        />
      )}
      <TotalRow amount={0} />
    </>
  )
}
