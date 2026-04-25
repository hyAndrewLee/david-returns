"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import StripeCheckout from "@/components/customer/StripeCheckout"
import { ScheduleButton } from "@/app/(customer)/schedule/steps/orderSummary/ScheduleButton"

export const CheckoutCTA = () => {
  const { formData, discountCode, discountApplied, showPayment, uploadedItems } = useSchedule()

  if (showPayment) {
    return (
      <div className="mt-6">
        <StripeCheckout
          plan={formData.plan}
          itemCount={formData.items.length}
          isInstant={formData.isInstant}
          pickupDate={formData.selectedDate}
          pickupTime={formData.timeWindow}
          pickupMethod={formData.pickupMethod}
          discountCode={discountApplied ? discountCode.trim().toUpperCase() : undefined}
          address={{
            fullName: formData.name,
            phone: formData.phone,
            street: formData.address,
            apt: formData.apt,
            city: formData.city,
            zip: formData.zip,
            notes: formData.notes,
            pickupInstructions: formData.pickupInstructions,
          }}
          items={uploadedItems}
        />
      </div>
    )
  }

  return <ScheduleButton />
}
