import type { PickupRequest, PickupStatus } from "@/lib/types"

// In-memory store - resets on redeploy
const pickups: PickupRequest[] = []

export function getAllPickups(): PickupRequest[] {
  return pickups.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addPickup(pickup: PickupRequest): void {
  pickups.push(pickup)
}

export function updatePickupStatus(id: string, status: PickupStatus): boolean {
  const pickup = pickups.find((p) => p.id === id)
  if (pickup) {
    pickup.status = status
    return true
  }
  return false
}

export function getPickupById(id: string): PickupRequest | undefined {
  return pickups.find((p) => p.id === id)
}
