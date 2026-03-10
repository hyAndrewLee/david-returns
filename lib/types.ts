export type PickupStatus = "New" | "In Progress" | "Completed"
export type PlanType = "Pay-As-You-Go" | "Membership"
export type ServiceType = "Standard" | "Instant"
export type ReturnType = "Pre-labeled package ready" | "Need us to bring label" | "Handle everything"
export type TimeWindow = "8–11am" | "11am–2pm" | "2–5pm" | "5–8pm"
export type LabelType = "has-label" | "email-pdf" | "amazon-qr" | "no-label"
export type PickupMethod = "hand-to-me" | "leave-at-door"

export interface PickupRequest {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  zip: string
  retailer: string
  itemsDescription: string
  returnType: ReturnType
  preferredDate: string
  timeWindow: TimeWindow
  notes?: string
  plan: PlanType
  numPackages?: number
  serviceType: ServiceType
  status: PickupStatus
  createdAt: string
  pickupMethod?: PickupMethod
  apt?: string
  items?: ReturnItem[]
}

export interface ReturnItem {
  id: string
  labelType: LabelType
  description: string
  retailer?: string
  packageSize?: "small" | "medium" | "large"
  photoFile?: File | null
  printOption?: "print-for-me" | "will-print"
  isBoxed?: boolean
  orderNumber?: string
  returnPortalLink?: string
  needHelpGettingLabel?: boolean
  file?: File | null
  needsBox?: boolean
  returnTo?: string
}

export interface PickupFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  zip: string
  retailer: string
  itemsDescription: string
  returnType: ReturnType
  preferredDate: string
  timeWindow: TimeWindow
  notes?: string
  plan: PlanType
  numPackages?: number
  serviceType: ServiceType
}
