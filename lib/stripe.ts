import "server-only"

import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
})

export function isCustomerNotFoundError(error: any): boolean {
  return (
    error?.type === "StripeInvalidRequestError" && error?.code === "resource_missing" && error?.param === "customer"
  )
}
