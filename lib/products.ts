export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  isRecurring?: boolean
}

// Source of truth for all products
export const PRODUCTS: Product[] = [
  {
    id: "pickup-base",
    name: "One-Time Pickup",
    description: "Base pickup fee for one item",
    priceInCents: 500,
  },
  {
    id: "additional-item",
    name: "Additional Item",
    description: "Fee per additional item after the first",
    priceInCents: 200, // $2.00
  },
  {
    id: "instant-pickup",
    name: "Instant Pickup",
    description: "Same-day instant pickup surcharge",
    priceInCents: 150, // $1.50 surcharge (total = $5 + $1.50 = $6.50)
  },
  {
    id: "unlimited-membership",
    name: "Unlimited Membership",
    description: "Unlimited pickups per month",
    priceInCents: 1499, // $14.99/month
    isRecurring: true,
  },
]

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id)
}
