"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { MemberBanner } from "@/app/(customer)/schedule/steps/orderSummary/MemberBanner"
import { UpgradeBanner } from "@/app/(customer)/schedule/steps/orderSummary/UpgradeBanner"
import { PricingLines } from "@/app/(customer)/schedule/steps/orderSummary/PricingLines"
import { DiscountSection } from "@/app/(customer)/schedule/steps/orderSummary/DiscountSection"
import { CheckoutCTA } from "@/app/(customer)/schedule/steps/orderSummary/CheckoutCTA"

export const OrderSummary = () => {
  const { isMember, showPayment } = useSchedule()

  return (
    <div className="rounded-[0.375rem] bg-surface-container-lowest p-6 sticky top-32">
      <h2 className="text-lg font-semibold text-foreground mb-4">Order summary</h2>

      {isMember && <MemberBanner />}

      <div className="space-y-3 text-sm">
        <PricingLines />
      </div>

      <UpgradeBanner />

      {!isMember && !showPayment && (
        <div className="mt-4">
          <DiscountSection />
        </div>
      )}

      <CheckoutCTA />
    </div>
  )
}
