type Product = {
  id: string
  name: string
  description: string
  priceInCents: number
  isRecurring?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: "pickup-base",
    name: "One-Time Pickup",
    description: "Base pickup fee for one item",
    priceInCents: 799,
  },
  {
    id: "additional-item",
    name: "Additional Item",
    description: "Fee per additional item after the first",
    priceInCents: 100,
  },
  {
    id: "instant-pickup",
    name: "Instant Pickup",
    description: "Same-day instant pickup surcharge",
    priceInCents: 150,
  },
  {
    id: "unlimited-membership",
    name: "Unlimited Membership",
    description: "Unlimited pickups per month",
    priceInCents: 2299,
    isRecurring: true,
  },
]

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id)

export const TIME_WINDOWS = ["8-11am", "11am-2pm", "2-5pm", "5-8pm"] as const

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  picked_up: "bg-green-500/10 text-green-500 border-green-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_transit: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  return_confirmed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  picked_up: "Picked Up",
  scheduled: "Scheduled",
  in_transit: "In Transit",
  return_confirmed: "Return Confirmed",
  delivered: "Delivered",
}

