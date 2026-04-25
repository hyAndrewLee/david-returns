"use client"

import { Zap, Tag } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { PriceRow } from "@/app/(customer)/schedule/steps/orderSummary/PriceRow"
import { TotalRow } from "@/app/(customer)/schedule/steps/orderSummary/TotalRow"

export const PayAsYouGoPricingLines = () => {
  const { formData, calculateTotal } = useSchedule()
  const total = calculateTotal()

  return (
    <>
      <PriceRow
        label={<span className="text-muted-foreground">Pickup fee</span>}
        value={<span className="text-foreground font-medium">${total.pickup.toFixed(2)}</span>}
      />
      {total.items > 0 && (
        <PriceRow
          label={<span className="text-muted-foreground">Additional items ({formData.items.length - 1})</span>}
          value={<span className="text-foreground font-medium">${total.items.toFixed(2)}</span>}
        />
      )}
      {formData.isInstant && (
        <PriceRow
          label={
            <span className="text-orange-600 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Instant pickup
            </span>
          }
          value={<span className="text-orange-600 font-medium">${total.instant.toFixed(2)}</span>}
        />
      )}
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
