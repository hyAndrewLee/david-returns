"use client"

import Link from "next/link"
import { Check, Sparkles } from "lucide-react"
import type { PlanType } from "@/lib/types"

const plans = [
  {
    name: "Pay-As-You-Go" as PlanType,
    price: "$5",
    priceDetail: "per pickup",
    extraInfo: "+ $2 per additional package",
    features: ["Free label printing", "Free shipping boxes", "Email & phone support", "No commitment"],
    highlighted: false,
  },
  {
    name: "Membership" as PlanType,
    price: "$14.99",
    priceDetail: "per month",
    extraInfo: "Unlimited pickups & packages",
    features: ["Unlimited pickups", "Free label printing", "Free shipping boxes", "No per-pickup fees"],
    highlighted: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute left-0 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-100/30 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 h-96 w-96 translate-x-1/2 rounded-full bg-blue-100/30 blur-3xl"></div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Pricing</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground">Choose the plan that works best for your returns</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 bg-card p-8 transition-all hover:shadow-xl ${
                plan.highlighted
                  ? "border-foreground shadow-lg scale-105"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>

              <div className="mt-6">
                <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                <span className="ml-2 text-muted-foreground">{plan.priceDetail}</span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{plan.extraInfo}</p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        plan.highlighted ? "bg-foreground" : "bg-secondary"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${plan.highlighted ? "text-background" : "text-foreground"}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="mt-8 block w-full rounded-full border-2 border-border bg-background py-3 text-center text-sm font-medium text-foreground transition-all duration-200 hover:scale-[1.02] hover:border-foreground hover:shadow-md"
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Pricing is currently for NYC pilot customers only.
        </p>
      </div>
    </section>
  )
}
