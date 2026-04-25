import type { OrderAddress } from "@/server/db/schema/orders"

type OrderLike = {
  address?: OrderAddress | null
  profiles?: {
    fullName?: string | null
    email?: string | null
    phone?: string | null
  } | null
}

type OrderCustomer = {
  fullName: string | null
  email: string | null
  phone: string | null
}

/**
 * Resolves customer display fields for an order, falling back from the
 * joined `profiles` row to values captured on the order's `address` JSON.
 * Matches the server-side resolution used in fulfillment + Slack notifier
 * so the admin UI shows the same name we emailed / posted.
 */
export const getOrderCustomer = (order: OrderLike): OrderCustomer => {
  const addr = (order.address ?? {}) as OrderAddress
  return {
    fullName: order.profiles?.fullName || addr.fullName || null,
    email: order.profiles?.email || null,
    phone: order.profiles?.phone || addr.phone || null,
  }
}
