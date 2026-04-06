import "server-only"

import type { OrderAddress, OrderItem } from "@/server/db/schema/orders"

const CHUNK_SIZE = 500

export type OrderMetadata = {
  userId: string
  plan: string
  isInstant: boolean
  itemCount: number
  totalAmount: number
  pickupDate: string
  pickupTime: string
  pickupMethod: string
  address: OrderAddress
  items: OrderItem[]
}

/**
 * Encodes order data into Stripe-safe metadata (max 500 chars per value, max 50 keys).
 * Scalar fields are stored as individual keys. The address + items blob is chunked
 * across multiple keys if it exceeds 500 characters.
 */
export const encodeOrderMetadata = (input: OrderMetadata): Record<string, string> => {
  const metadata: Record<string, string> = {
    user_id: input.userId,
    plan: input.plan,
    is_instant: input.isInstant ? "true" : "false",
    item_count: input.itemCount.toString(),
    total_amount: input.totalAmount.toString(),
    pickup_date: input.pickupDate,
    pickup_time: input.pickupTime,
    pickup_method: input.pickupMethod,
  }

  const blob = JSON.stringify({ address: input.address, items: input.items })

  if (blob.length <= CHUNK_SIZE) {
    metadata.order_data = blob
  } else {
    const chunkCount = Math.ceil(blob.length / CHUNK_SIZE)
    for (let i = 0; i < chunkCount; i++) {
      metadata[`order_data_${i}`] = blob.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    }
    metadata.order_data_chunks = chunkCount.toString()
  }

  return metadata
}

/**
 * Decodes order data that was encoded into Stripe session metadata via `encodeOrderMetadata`.
 * Returns null if required fields are missing.
 */
export const decodeOrderMetadata = (metadata: Record<string, string> | null): OrderMetadata | null => {
  if (!metadata?.user_id) return null

  let blob: string
  if (metadata.order_data) {
    blob = metadata.order_data
  } else if (metadata.order_data_chunks) {
    const chunkCount = parseInt(metadata.order_data_chunks)
    blob = ""
    for (let i = 0; i < chunkCount; i++) {
      blob += metadata[`order_data_${i}`] ?? ""
    }
  } else {
    return null
  }

  let parsed: { address?: OrderAddress; items?: OrderItem[] }
  try {
    parsed = JSON.parse(blob)
  } catch {
    return null
  }

  return {
    userId: metadata.user_id,
    plan: metadata.plan ?? "Pay-As-You-Go",
    isInstant: metadata.is_instant === "true",
    itemCount: parseInt(metadata.item_count ?? "0"),
    totalAmount: parseInt(metadata.total_amount ?? "0"),
    pickupDate: metadata.pickup_date ?? new Date().toISOString().split("T")[0],
    pickupTime: metadata.pickup_time ?? "",
    pickupMethod: metadata.pickup_method ?? "hand-to-me",
    address: parsed.address ?? {},
    items: parsed.items ?? [],
  }
}
