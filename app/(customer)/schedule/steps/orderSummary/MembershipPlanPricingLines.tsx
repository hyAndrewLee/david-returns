"use client"

import { Tag } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { PriceRow } from "@/app/(customer)/schedule/steps/orderSummary/PriceRow"
import { TotalRow } from "@/app/(customer)/schedule/steps/orderSummary/TotalRow"

export const MembershipPlanPricingLines = () => {
  const { calculateTotal } = useSchedule()
  const total = calculateTotal()

  return (
    <>
      <PriceRow
        label={<span className="text-muted-foreground">Unlimited membership</span>}
        value={<span className="text-foreground font-medium">$22.99/mo</span>}
      />
      <PriceRow
        label={<span className="text-muted-foreground">This pickup</span>}
        value={<span className="text-emerald-600 font-medium">FREE</span>}
      />
      {total.discount > 0 && (
        <PriceRow
          label={
            <span className="text-emerald-600 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Discount
            </span>
          }
          value={<span className="text-emerald-600 font-medium">-${total.discount.toFixed(2)}</span>}
        />
      )}
      <TotalRow amount={total.total} />
    </>
  )
}
