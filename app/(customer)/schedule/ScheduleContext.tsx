"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  Calendar,
  MapPin,
  Hand,
  CreditCard,
  Package,
  Truck,
} from "lucide-react"
import type { PlanType, LabelType, PickupMethod, ReturnItem, TimeWindow } from "@/lib/types"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { trpc } from "@/lib/trpc"
import { getDateOffsetET, getCurrentTimeET } from "@/lib/timezone"
import { compressImage } from "@/lib/imageCompression"

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// === Types ===

export type SavedAddress = {
  id: string
  label: string
  full_name: string
  phone: string
  street_address: string
  apt: string | null
  building_name: string | null
  city: string
  zip: string
  notes: string | null
  is_default: boolean
}

export type ModalStep =
  | "select-type"
  | "has-label-details"
  | "email-pdf-details"
  | "amazon-qr-details"
  | "no-label-details"

export type ScheduleFormData = {
  selectedDate: string
  timeWindow: TimeWindow
  isInstant: boolean
  name: string
  phone: string
  address: string
  apt: string
  buildingName: string
  city: string
  zip: string
  notes: string
  pickupMethod: PickupMethod
  pickupInstructions: string
  plan: PlanType
  items: ReturnItem[]
}

/** Maps Supabase auth user_metadata (raw_user_meta_data) from signup into schedule form fields. */
const formDataFromSignupUserMetadata = (
  meta: Record<string, unknown> | undefined,
): Partial<ScheduleFormData> | null => {
  if (!meta) return null
  const street =
    typeof meta.street_address === "string" ? meta.street_address.trim() : ""
  const zip = typeof meta.zip === "string" ? meta.zip.trim() : ""
  if (!street && !zip) return null

  const name = typeof meta.full_name === "string" ? meta.full_name : ""
  const phone = typeof meta.phone === "string" ? meta.phone : ""
  const apt = typeof meta.apt === "string" ? meta.apt : ""
  const city =
    typeof meta.city === "string" && meta.city.trim() ? meta.city : "New York"

  return {
    name,
    phone,
    address: street,
    apt,
    buildingName: "",
    city,
    zip,
    notes: "",
  }
}

export type NewItemState = {
  type: string
  labelType: LabelType | ""
  retailer: string
  description: string
  trackingNumber: string
  labelFile: File | null
  packageSize: "small" | "medium" | "large"
  printOption: "print-for-me" | "will-print"
  isBoxed: boolean
  needsHelp: boolean
  orderNumber: string
  returnPortalLink: string
  proofFile: File | null
  needsBox: boolean
  returnTo: string
  returnToOther: string
  photoFile: File | null
  file: File | null
  needHelpGettingLabel: boolean
  notes: string
}

export type DateInfo = {
  date: string
  dayName: string
  dayNum: number
  month: string
  isSunday: boolean
  isToday: boolean
  isTomorrow: boolean
  isDayAfterTomorrow: boolean
  label: string
}

export type OrderTotal = {
  pickup: number
  items: number
  instant: number
  total: number
  isMembership: boolean
  isExistingMember: boolean
}

// === Constants ===

export const STEPS = [
  { id: 1, title: "Schedule", icon: Calendar },
  { id: 2, title: "Address", icon: MapPin },
  { id: 3, title: "Pickup", icon: Hand },
  { id: 4, title: "Plan", icon: CreditCard },
  { id: 5, title: "Items", icon: Package },
  { id: 6, title: "Checkout", icon: Truck },
]

/** Unlimited members skip the plan step entirely — same step ids, but Plan (4) is omitted from the UI. */
export const getScheduleSteps = (membershipChecked: boolean, isMember: boolean) =>
  membershipChecked && isMember ? STEPS.filter((s) => s.id !== 4) : STEPS

export const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "8–11am", label: "8–11am" },
  { value: "11am–2pm", label: "11am–2pm" },
  { value: "2–5pm", label: "2–5pm" },
  { value: "5–8pm", label: "5–8pm" },
]

const DISABLE_IMAGE_COMPRESSION = false

export const isTimeWindowPassed = (timeWindow: TimeWindow): boolean => {
  const { hour, minute } = getCurrentTimeET()
  const currentMinutes = hour * 60 + minute

  const timeWindowEndMinutes: Record<TimeWindow, number> = {
    "8–11am": 11 * 60,
    "11am–2pm": 14 * 60,
    "2–5pm": 17 * 60,
    "5–8pm": 20 * 60,
  }

  const endMinutes = timeWindowEndMinutes[timeWindow]
  return endMinutes ? currentMinutes >= endMinutes : false
}

// CRITICAL: This function generates dates in Eastern Time (ET) timezone.
// The getDateOffsetET() utility returns dates as YYYY-MM-DD strings in ET timezone.
// These date strings are saved directly to the database without timezone conversion.
const generateDates = (): DateInfo[] => {
  const dates: DateInfo[] = []

  for (let i = 0; i < 7; i++) {
    const dateStr = getDateOffsetET(i)
    const date = new Date(dateStr + "T12:00:00")

    const dayName = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" })
    const dayNum = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "America/New_York" })
    const isSunday = date.getDay() === 0
    const isToday = i === 0
    const isTomorrow = i === 1
    const isDayAfterTomorrow = i === 2

    dates.push({
      date: dateStr,
      dayName,
      dayNum,
      month,
      isSunday,
      isToday,
      isTomorrow,
      isDayAfterTomorrow,
      label: isToday ? "Today" : isTomorrow ? "Tomorrow" : dayName,
    })
  }

  return dates
}

const DEFAULT_NEW_ITEM: NewItemState = {
  type: "",
  labelType: "" as LabelType | "",
  retailer: "",
  description: "",
  trackingNumber: "",
  labelFile: null,
  packageSize: "small",
  printOption: "print-for-me",
  isBoxed: true,
  needsHelp: false,
  orderNumber: "",
  returnPortalLink: "",
  proofFile: null,
  needsBox: true,
  returnTo: "",
  returnToOther: "",
  photoFile: null,
  file: null,
  needHelpGettingLabel: false,
  notes: "",
}

// === Context ===

type ScheduleContextValue = {
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  handleNextStep: () => void
  handlePreviousStep: () => void
  canProceed: () => boolean
  returnToStep: number | null
  editFromCheckout: (step: number) => void

  formData: ScheduleFormData
  setFormData: React.Dispatch<React.SetStateAction<ScheduleFormData>>

  dates: DateInfo[]
  handleDateSelect: (date: string, isToday: boolean) => void

  savedAddresses: SavedAddress[]
  selectedAddressId: string | null
  setSelectedAddressId: React.Dispatch<React.SetStateAction<string | null>>
  showAddressForm: boolean
  setShowAddressForm: React.Dispatch<React.SetStateAction<boolean>>
  saveThisAddress: boolean
  setSaveThisAddress: React.Dispatch<React.SetStateAction<boolean>>
  userId: string | null
  handleSelectAddress: (address: SavedAddress) => void
  handleCancelAddressForm: () => void
  handleShowNewAddressForm: () => void
  prefilledFromSignup: boolean

  isMember: boolean
  membershipChecked: boolean

  newItem: NewItemState
  setNewItem: React.Dispatch<React.SetStateAction<NewItemState>>
  editingItemId: string | null
  showItemModal: boolean
  modalStep: ModalStep
  setModalStep: React.Dispatch<React.SetStateAction<ModalStep>>
  editItem: (item: ReturnItem) => void
  addItem: () => void
  removeItem: (id: string) => void
  handleOpenAddItemModal: () => void
  closeModal: () => void
  handleItemModalOpenChange: (open: boolean) => void
  validateFileSize: (file: File) => string | null

  calculateTotal: () => OrderTotal
  showPayment: boolean
  setShowPayment: React.Dispatch<React.SetStateAction<boolean>>
  uploadFilesAndProceedToPayment: () => Promise<void>
  isUploadingFiles: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadedItems: any[]

  error: string
  setError: React.Dispatch<React.SetStateAction<string>>

  DEBUG_UPLOAD: boolean
  debugFileInfo: string
  setDebugFileInfo: React.Dispatch<React.SetStateAction<string>>
  showInstantInfo: boolean
  setShowInstantInfo: React.Dispatch<React.SetStateAction<boolean>>
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null)

export const useSchedule = () => {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider")
  return ctx
}

export const ScheduleProvider = ({ children }: { children: React.ReactNode }) => {
  const DEBUG_UPLOAD = process.env.NEXT_PUBLIC_DEBUG_UPLOAD === "true"

  const [currentStep, setCurrentStep] = useState(1)
  const [returnToStep, setReturnToStep] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [showItemModal, setShowItemModal] = useState(false)
  const [debugFileInfo, setDebugFileInfo] = useState<string>("")
  const [modalStep, setModalStep] = useState<ModalStep>("select-type")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [dates] = useState(generateDates)
  const [showPayment, setShowPayment] = useState(false)
  const [showInstantInfo, setShowInstantInfo] = useState(false)

  const [isMember, setIsMember] = useState(false)
  const [membershipChecked, setMembershipChecked] = useState(false)

  const membershipQuery = trpc.stripe.checkMembership.useQuery(undefined, {
    retry: false,
  })
  const addressesQuery = trpc.addresses.list.useQuery(undefined, {
    retry: false,
  })
  const uploadLabelMutation = trpc.upload.uploadLabel.useMutation()

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [saveThisAddress, setSaveThisAddress] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [prefilledFromSignup, setPrefilledFromSignup] = useState(false)

  const [formData, setFormData] = useState<ScheduleFormData>({
    selectedDate: "",
    timeWindow: "11am–2pm",
    isInstant: false,
    name: "",
    phone: "",
    address: "",
    apt: "",
    buildingName: "",
    city: "New York",
    zip: "",
    notes: "",
    pickupMethod: "hand-to-me",
    pickupInstructions: "",
    plan: "Pay-As-You-Go",
    items: [],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadedItems, setUploadedItems] = useState<any[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [newItem, setNewItem] = useState<NewItemState>({ ...DEFAULT_NEW_ITEM })

  // === Effects ===

  useEffect(() => {
    if (membershipQuery.data) {
      setIsMember(membershipQuery.data.isMember)
      if (membershipQuery.data.isMember) {
        setFormData((prev) => ({ ...prev, plan: "Membership" }))
      }
      setMembershipChecked(true)
    } else if (membershipQuery.error) {
      setMembershipChecked(true)
    }
  }, [membershipQuery.data, membershipQuery.error])

  useEffect(() => {
    if (!membershipChecked || !isMember) return
    setCurrentStep((s) => (s === 4 ? 5 : s))
  }, [membershipChecked, isMember])

  useEffect(() => {
    const user = localStorage.getItem("davidreturns_user")
    if (user) {
      const { name } = JSON.parse(user)
      setFormData((prev) => ({ ...prev, name: name || "" }))
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      } else {
        setShowAddressForm(true)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (addressesQuery.data && addressesQuery.data.length > 0) {
      const mapped: SavedAddress[] = addressesQuery.data.map((a) => ({
        id: a.id,
        label: a.label || "Home",
        full_name: a.fullName,
        phone: a.phone,
        street_address: a.streetAddress,
        apt: a.apt,
        building_name: a.buildingName,
        city: a.city,
        zip: a.zip,
        notes: a.notes,
        is_default: a.isDefault ?? false,
      }))
      setSavedAddresses(mapped)
      const defaultAddr = mapped.find((a) => a.is_default) || mapped[0]
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        populateFormFromAddress(defaultAddr)
      }
    } else if (addressesQuery.data && addressesQuery.data.length === 0) {
      setShowAddressForm(true)

      const applySignupAddress = async () => {
        const supabase = createBrowserSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const partial = formDataFromSignupUserMetadata(
          user?.user_metadata as Record<string, unknown> | undefined,
        )
        if (partial) {
          setFormData((prev) => ({ ...prev, ...partial }))
          setPrefilledFromSignup(true)
        }
      }

      void applySignupAddress()
    }
  }, [addressesQuery.data])

  // === Handlers ===

  const validateFileSize = (file: File): string | null => {
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      const isPDF = file.type === "application/pdf"

      if (isPDF) {
        return `PDF file (${sizeMB}MB) is too large. Maximum size is 5MB. Please take a screenshot of your label instead.`
      }
      return `File (${sizeMB}MB) is too large. Maximum size is 5MB. Please compress or choose a smaller file.`
    }
    return null
  }

  const populateFormFromAddress = (address: SavedAddress) => {
    setFormData((prev) => ({
      ...prev,
      name: address.full_name,
      phone: address.phone,
      address: address.street_address,
      apt: address.apt || "",
      buildingName: address.building_name || "",
      city: address.city,
      zip: address.zip,
      notes: address.notes || "",
    }))
  }

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id)
    populateFormFromAddress(address)
    setShowAddressForm(false)
  }

  const handleCancelAddressForm = () => {
    setShowAddressForm(false)
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0]
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        populateFormFromAddress(defaultAddr)
      }
    }
  }

  const handleShowNewAddressForm = () => {
    setSelectedAddressId(null)
    setShowAddressForm(true)
    setPrefilledFromSignup(false)
    setFormData((prev) => ({
      ...prev,
      name: "",
      phone: "",
      address: "",
      apt: "",
      buildingName: "",
      city: "New York",
      zip: "",
      notes: "",
    }))
  }

  const handleDateSelect = (date: string, isToday: boolean) => {
    setError("")

    const now = new Date()
    const currentHour = now.getHours()

    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const tomorrowDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`
    const isTomorrow = date === tomorrowDate

    if (isToday) {
      if (currentHour >= 20) {
        setFormData((prev) => ({ ...prev, selectedDate: date, isInstant: false }))
        setError("It's too late for instant pickup today. Please select tomorrow or a future date.")
        return
      }

      setFormData((prev) => ({ ...prev, selectedDate: date, isInstant: true }))
      const firstAvailableWindow = TIME_WINDOWS.find((tw) => !isTimeWindowPassed(tw.value))
      if (firstAvailableWindow) {
        setFormData((prev) => ({ ...prev, timeWindow: firstAvailableWindow.value }))
      }
    } else {
      const isInstantPickup = currentHour >= 20 && isTomorrow
      setFormData((prev) => ({ ...prev, selectedDate: date, isInstant: isInstantPickup }))
    }
  }

  const editItem = (item: ReturnItem) => {
    setEditingItemId(item.id)
    setNewItem({
      type: "",
      labelType: item.labelType,
      retailer: item.retailer || "",
      description: item.description,
      trackingNumber: "",
      labelFile: null,
      packageSize: item.packageSize || "small",
      printOption: item.printOption || "print-for-me",
      isBoxed: item.isBoxed !== false,
      needsHelp: false,
      orderNumber: item.orderNumber || "",
      returnPortalLink: item.returnPortalLink || "",
      proofFile: null,
      needsBox: item.needsBox !== false,
      returnTo: item.returnTo || "",
      returnToOther: "",
      photoFile: item.photoFile || null,
      file: item.file || null,
      needHelpGettingLabel: item.needHelpGettingLabel || false,
      notes: item.notes || "",
    })
    if (item.labelType === "has-label") {
      setModalStep("has-label-details")
    } else if (item.labelType === "email-pdf") {
      setModalStep("email-pdf-details")
    } else if (item.labelType === "amazon-qr") {
      setModalStep("amazon-qr-details")
    } else if (item.labelType === "no-label") {
      setModalStep("no-label-details")
    }
    setShowItemModal(true)
  }

  const addItem = () => {
    if (!newItem.description.trim()) {
      setError("Please enter a description for the item.")
      return
    }
    if (newItem.labelType !== "amazon-qr") {
      if (!newItem.returnTo && newItem.returnTo !== "Other") {
        setError("Please select a drop-off location.")
        return
      }
      if (newItem.returnTo === "Other" && !newItem.returnToOther.trim()) {
        setError("Please specify the 'Other' drop-off location.")
        return
      }
    }
    if (!newItem.packageSize) {
      setError("Please select a package size.")
      return
    }
    if (newItem.labelType === "email-pdf" && !newItem.file) {
      setError("Please upload your label file.")
      return
    }
    if (newItem.labelType === "amazon-qr" && !newItem.file) {
      setError("Please upload your QR code.")
      return
    }
    if (
      newItem.labelType === "no-label" &&
      newItem.needHelpGettingLabel &&
      !newItem.file &&
      !newItem.returnPortalLink
    ) {
      setError("Please upload proof of purchase or provide a return portal link.")
      return
    }
    if (newItem.labelType === "amazon-qr" && !newItem.retailer) {
      setError("Please select the retailer.")
      return
    }

    const item: ReturnItem = {
      id: editingItemId || Date.now().toString(),
      labelType: newItem.labelType as LabelType,
      description: newItem.description,
      retailer: newItem.retailer,
      packageSize: newItem.packageSize,
      photoFile: newItem.photoFile,
      printOption: newItem.printOption,
      isBoxed: newItem.isBoxed,
      orderNumber: newItem.orderNumber,
      returnPortalLink: newItem.returnPortalLink,
      needHelpGettingLabel: newItem.needHelpGettingLabel,
      needsBox: newItem.needsBox,
      returnTo: newItem.returnTo === "Other" ? newItem.returnToOther : newItem.returnTo,
      file: newItem.file,
      notes: newItem.notes,
    }

    if (editingItemId) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === editingItemId ? item : i)),
      }))
    } else {
      setFormData((prev) => ({ ...prev, items: [...prev.items, item] }))
    }

    setEditingItemId(null)
    setNewItem({ ...DEFAULT_NEW_ITEM })
    setModalStep("select-type")
    setShowItemModal(false)
    setError("")
  }

  const removeItem = (id: string) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }))
  }

  const handleOpenAddItemModal = () => {
    setEditingItemId(null)
    setModalStep("select-type")
    setNewItem({ ...DEFAULT_NEW_ITEM })
    setShowItemModal(true)
  }

  const closeModal = () => {
    setShowItemModal(false)
    setModalStep("select-type")
    setEditingItemId(null)
    setNewItem({ ...DEFAULT_NEW_ITEM })
  }

  const handleItemModalOpenChange = (open: boolean) => {
    setShowItemModal(open)
    if (!open) {
      setEditingItemId(null)
      setModalStep("select-type")
      setNewItem({ ...DEFAULT_NEW_ITEM })
    }
  }

  const calculateTotal = (): OrderTotal => {
    if (isMember) {
      return { pickup: 0, items: 0, instant: 0, total: 0, isMembership: true, isExistingMember: true }
    }

    if (formData.plan === "Membership") {
      return { pickup: 0, items: 0, instant: 0, total: 22.99, isMembership: true, isExistingMember: false }
    }

    const pickup = 7.99
    const additionalItems = Math.max(0, formData.items.length - 1) * 1
    const instant = formData.isInstant ? 1.5 : 0
    const subtotal = pickup + additionalItems + instant

    return { pickup, items: additionalItems, instant, total: subtotal, isMembership: false, isExistingMember: false }
  }

  const uploadFilesAndProceedToPayment = async () => {
    setIsUploadingFiles(true)
    setError("")
    if (DEBUG_UPLOAD) {
      setDebugFileInfo("")
    }

    try {
      for (const item of formData.items) {
        if (item.file) {
          const sizeError = validateFileSize(item.file)
          if (sizeError) throw new Error(sizeError)
        }
        if (item.photoFile) {
          const sizeError = validateFileSize(item.photoFile)
          if (sizeError) throw new Error(sizeError)
        }
      }

      const itemsWithUrls = await Promise.all(
        formData.items.map(async (item) => {
          let labelFileUrl = null

          if (item.file) {
            if (DEBUG_UPLOAD) {
              setDebugFileInfo(
                `📄 File selected: ${item.file.name}\nType: ${item.file.type}\nSize: ${(item.file.size / 1024 / 1024).toFixed(2)}MB`,
              )
            }

            let fileToUpload = item.file
            const isImage = item.file.type.startsWith("image/") || !!item.file.name.match(/\.(heic|heif|jpg|jpeg|png)$/i)

            if (isImage && !DISABLE_IMAGE_COMPRESSION) {
              if (DEBUG_UPLOAD) {
                setDebugFileInfo((prev) => `${prev}\n\n🔄 Attempting image compression...`)
              }
              try {
                fileToUpload = await compressImage(item.file, 4)
                if (DEBUG_UPLOAD) {
                  setDebugFileInfo(
                    (prev) =>
                      `${prev}\n✅ Compression successful\nCompressed size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
                  )
                }
              } catch (compressionError) {
                if (DEBUG_UPLOAD) {
                  setDebugFileInfo(
                    (prev) =>
                      `${prev}\n⚠️ Compression failed: ${compressionError instanceof Error ? compressionError.message : "Unknown error"}\nUsing original file`,
                  )
                }
                fileToUpload = item.file
              }
            } else if (DISABLE_IMAGE_COMPRESSION) {
              if (DEBUG_UPLOAD) {
                setDebugFileInfo((prev) => `${prev}\n\n⏭️ Compression disabled, using original file`)
              }
            }

            if (DEBUG_UPLOAD) {
              setDebugFileInfo(
                (prev) =>
                  `${prev}\n\n📤 Uploading file...\nName: ${fileToUpload.name}\nType: ${fileToUpload.type}\nSize: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
              )
            }

            try {
              const base64 = await fileToBase64(fileToUpload)
              const result = await uploadLabelMutation.mutateAsync({
                base64,
                name: fileToUpload.name,
                type: fileToUpload.type,
                size: fileToUpload.size,
              })
              if (result.error || !result.url) {
                throw new Error(result.error || "Upload returned no URL")
              }
              labelFileUrl = result.url
            } catch (uploadError) {
              console.error("Label file upload failed:", uploadError)
              if (DEBUG_UPLOAD) {
                setDebugFileInfo(
                  (prev) =>
                    `${prev}\n\n❌ Upload Error:\n${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
                )
              }
              throw new Error(
                uploadError instanceof Error ? uploadError.message : "Failed to upload label file. Please try again.",
              )
            }
          } else {
            if (DEBUG_UPLOAD) {
              setDebugFileInfo((prev) => `${prev}\n\n⏭️ No label file to upload`)
            }
          }

          let photoFileUrl = null
          if (item.photoFile) {
            if (DEBUG_UPLOAD) {
              setDebugFileInfo(
                (prev) =>
                  `${prev}\n\n📸 Photo file selected: ${item.photoFile!.name}\nType: ${item.photoFile!.type}\nSize: ${(item.photoFile!.size / 1024 / 1024).toFixed(2)}MB`,
              )
            }

            let photoToUpload = item.photoFile
            const isPhotoImage =
              item.photoFile.type.startsWith("image/") || !!item.photoFile.name.match(/\.(heic|heif|jpg|jpeg|png)$/i)

            if (isPhotoImage && !DISABLE_IMAGE_COMPRESSION) {
              if (DEBUG_UPLOAD) {
                setDebugFileInfo((prev) => `${prev}\n\n🔄 Attempting image compression...`)
              }
              try {
                photoToUpload = await compressImage(item.photoFile, 4)
                if (DEBUG_UPLOAD) {
                  setDebugFileInfo(
                    (prev) =>
                      `${prev}\n✅ Compression successful\nCompressed size: ${(photoToUpload.size / 1024 / 1024).toFixed(2)}MB`,
                  )
                }
              } catch (compressionError) {
                if (DEBUG_UPLOAD) {
                  setDebugFileInfo(
                    (prev) =>
                      `${prev}\n⚠️ Compression failed: ${compressionError instanceof Error ? compressionError.message : "Unknown error"}\nUsing original file`,
                  )
                }
                photoToUpload = item.photoFile
              }
            } else if (DISABLE_IMAGE_COMPRESSION) {
              if (DEBUG_UPLOAD) {
                setDebugFileInfo((prev) => `${prev}\n\n⏭️ Compression disabled, using original file`)
              }
            }

            if (DEBUG_UPLOAD) {
              setDebugFileInfo(
                (prev) =>
                  `${prev}\n\n📤 Uploading photo...\nName: ${photoToUpload.name}\nType: ${photoToUpload.type}\nSize: ${(photoToUpload.size / 1024 / 1024).toFixed(2)}MB`,
              )
            }

            try {
              const base64 = await fileToBase64(photoToUpload)
              const result = await uploadLabelMutation.mutateAsync({
                base64,
                name: photoToUpload.name,
                type: photoToUpload.type,
                size: photoToUpload.size,
              })
              if (result.error || !result.url) {
                throw new Error(result.error || "Upload returned no URL")
              }
              photoFileUrl = result.url
            } catch (uploadError) {
              console.error("Photo file upload failed:", uploadError)
              if (DEBUG_UPLOAD) {
                setDebugFileInfo(
                  (prev) =>
                    `${prev}\n\n❌ Upload Error:\n${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
                )
              }
              throw new Error(
                uploadError instanceof Error ? uploadError.message : "Failed to upload photo file. Please try again.",
              )
            }
          } else {
            if (DEBUG_UPLOAD) {
              setDebugFileInfo((prev) => `${prev}\n\n⏭️ No photo file to upload`)
            }
          }

          return {
            description: item.description,
            retailer: item.retailer,
            labelType: item.labelType,
            packageSize: item.packageSize,
            photoUrl: photoFileUrl ?? undefined,
            printOption: item.printOption,
            isBoxed: item.isBoxed,
            orderNumber: item.orderNumber,
            returnPortalLink: item.returnPortalLink,
            needHelpGettingLabel: item.needHelpGettingLabel,
            labelFileUrl: labelFileUrl ?? undefined,
            needsBox: item.needsBox,
            returnTo: item.returnTo,
            notes: item.notes,
          }
        }),
      )

      setUploadedItems(itemsWithUrls)
      setError("")
      setShowPayment(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload files. Please try again."
      setError(errorMsg)
      if (DEBUG_UPLOAD) {
        setDebugFileInfo((prev) => `${prev}\n\n❗ FINAL ERROR: ${errorMsg}`)
        console.error("Error during file upload process:", err)
      }
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.selectedDate && formData.timeWindow)
      case 2:
        if (showAddressForm) {
          return !!(formData.name && formData.phone && formData.address && formData.zip)
        }
        return selectedAddressId !== null || !!(formData.name && formData.phone && formData.address && formData.zip)
      case 3:
        return !!formData.pickupMethod
      case 4:
        if (isMember) return true
        return !!formData.plan
      case 5:
        return formData.items.length > 0
      case 6:
        return true
      default:
        return false
    }
  }

  const saveNewAddress = async (): Promise<boolean> => {
    if (!userId) return false

    const supabase = createBrowserSupabaseClient()
    const { data, error: insertError } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        label: savedAddresses.length === 0 ? "Home" : `Address ${savedAddresses.length + 1}`,
        full_name: formData.name,
        phone: formData.phone,
        street_address: formData.address,
        apt: formData.apt || null,
        building_name: formData.buildingName || null,
        city: formData.city,
        zip: formData.zip,
        notes: formData.notes || null,
        is_default: savedAddresses.length === 0,
      })
      .select()
      .single()

    if (data) {
      setSavedAddresses((prev) => [...prev, data])
      setSelectedAddressId(data.id)
      return true
    }
    console.error("Failed to save new address:", insertError)
    return false
  }

  const editFromCheckout = (step: number) => {
    setReturnToStep(6)
    setCurrentStep(step)
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.selectedDate) {
      setError("Please select a pickup date.")
      return
    }
    if (currentStep === 1 && !formData.timeWindow) {
      setError("Please select a time window.")
      return
    }
    if (currentStep === 2 && !showAddressForm && !selectedAddressId) {
      setError("Please select an address.")
      return
    }
    if (currentStep === 2 && showAddressForm && !formData.name) {
      setError("Please fill in your name.")
      return
    }
    if (currentStep === 2 && showAddressForm && !formData.phone) {
      setError("Please fill in your phone number.")
      return
    }
    if (currentStep === 2 && showAddressForm && !formData.address) {
      setError("Please fill in your street address.")
      return
    }
    if (currentStep === 2 && showAddressForm && !formData.zip) {
      setError("Please fill in your ZIP code.")
      return
    }
    if (currentStep === 3 && !formData.pickupMethod) {
      setError("Please select a pickup method.")
      return
    }
    if (currentStep === 4 && !isMember && !formData.plan) {
      setError("Please select a plan.")
      return
    }
    if (currentStep === 5 && formData.items.length === 0) {
      setError("Please add at least one item to return.")
      return
    }

    if (currentStep === 2 && showAddressForm && saveThisAddress && userId && !selectedAddressId) {
      saveNewAddress().then((saved) => {
        if (!saved) {
          setError("Failed to save address. Please try again.")
          return
        }
        setShowAddressForm(false)
        setError("")
        if (returnToStep !== null) {
          const target = returnToStep
          setReturnToStep(null)
          setCurrentStep(target)
        } else {
          setCurrentStep((prev) => (prev === 3 && isMember ? 5 : prev + 1))
        }
      })
      return
    }

    setError("")

    if (returnToStep !== null) {
      const target = returnToStep
      setReturnToStep(null)
      setCurrentStep(target)
      return
    }

    setCurrentStep((prev) => (prev === 3 && isMember ? 5 : prev + 1))
  }

  const handlePreviousStep = () => {
    if (returnToStep !== null) {
      setReturnToStep(null)
      setCurrentStep(returnToStep)
      return
    }

    if (currentStep === 2 && showAddressForm && savedAddresses.length > 0) {
      handleCancelAddressForm()
      return
    }

    setCurrentStep((prev) => (prev === 5 && isMember ? 3 : prev - 1))
  }

  const value: ScheduleContextValue = {
    currentStep,
    setCurrentStep,
    handleNextStep,
    handlePreviousStep,
    canProceed,
    returnToStep,
    editFromCheckout,
    formData,
    setFormData,
    dates,
    handleDateSelect,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    showAddressForm,
    setShowAddressForm,
    saveThisAddress,
    setSaveThisAddress,
    userId,
    handleSelectAddress,
    handleCancelAddressForm,
    handleShowNewAddressForm,
    prefilledFromSignup,
    isMember,
    membershipChecked,
    newItem,
    setNewItem,
    editingItemId,
    showItemModal,
    modalStep,
    setModalStep,
    editItem,
    addItem,
    removeItem,
    handleOpenAddItemModal,
    closeModal,
    handleItemModalOpenChange,
    validateFileSize,
    calculateTotal,
    showPayment,
    setShowPayment,
    uploadFilesAndProceedToPayment,
    isUploadingFiles,
    uploadedItems,
    error,
    setError,
    DEBUG_UPLOAD,
    debugFileInfo,
    setDebugFileInfo,
    showInstantInfo,
    setShowInstantInfo,
  }

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}
