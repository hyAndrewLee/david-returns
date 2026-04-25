"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { MemberPricingLines } from "@/app/(customer)/schedule/steps/orderSummary/MemberPricingLines"
import { MembershipPlanPricingLines } from "@/app/(customer)/schedule/steps/orderSummary/MembershipPlanPricingLines"
import { PayAsYouGoPricingLines } from "@/app/(customer)/schedule/steps/orderSummary/PayAsYouGoPricingLines"

export const PricingLines = () => {
  const { isMember, calculateTotal } = useSchedule()
  const total = calculateTotal()

  if (isMember) return <MemberPricingLines />
  if (total.isMembership) return <MembershipPlanPricingLines />
  return <PayAsYouGoPricingLines />
}
