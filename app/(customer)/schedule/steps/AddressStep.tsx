"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { SavedAddressList } from "@/app/(customer)/schedule/steps/SavedAddressList"
import { AddressForm } from "@/app/(customer)/schedule/steps/AddressForm"

export const AddressStep = () => {
  const { savedAddresses, showAddressForm, prefilledFromSignup } = useSchedule()

  const subtitle =
    savedAddresses.length > 0 && !showAddressForm
      ? "Select your pickup address or add a new one."
      : prefilledFromSignup
        ? "We filled in the address from when you signed up. Update it here if anything changed."
        : "Enter your pickup address and contact info."

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">Address</span>
        <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
          Where should we pick&nbsp;up?
        </h1>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      </div>

      {savedAddresses.length > 0 && !showAddressForm && <SavedAddressList />}
      {(showAddressForm || savedAddresses.length === 0) && <AddressForm />}
    </div>
  )
}
