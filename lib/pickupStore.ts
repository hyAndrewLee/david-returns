import type { PickupRequest, PickupStatus } from "@/lib/types"

// In-memory store - resets on redeploy
const pickups: PickupRequest[] = []

export const getAllPickups = (): PickupRequest[] => {
  return pickups.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const addPickup = (pickup: PickupRequest): void => {
  pickups.push(pickup)
}

export const updatePickupStatus = (id: string, status: PickupStatus): boolean => {
  const pickup = pickups.find((p) => p.id === id)
  if (pickup) {
    pickup.status = status
    return true
  }
  return false
}

export const getPickupById = (id: string): PickupRequest | undefined => {
  return pickups.find((p) => p.id === id)
}
