"use client"

import { CheckoutDetailsCards } from "@/app/(customer)/schedule/steps/CheckoutDetailsCards"
import { OrderSummary } from "@/app/(customer)/schedule/steps/OrderSummary"

export const CheckoutStep = () => (
  <div className="space-y-8">
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">Review & Confirm</span>
      <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
        Confirm your pickup
      </h1>
      <p className="mt-3 text-muted-foreground">Review your details before confirming.</p>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <CheckoutDetailsCards />
      <OrderSummary />
    </div>
  </div>
)
