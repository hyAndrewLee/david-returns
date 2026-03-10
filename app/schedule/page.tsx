"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  Package,
  Hand,
  DoorOpen,
  Zap,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Edit2,
  Sparkles,
  Camera,
  Truck,
  Home,
  Building,
  Upload,
  Crown,
} from "lucide-react"
import type { PlanType, LabelType, PickupMethod, ReturnItem, TimeWindow } from "@/lib/types"
import StripeCheckout from "@/components/StripeCheckout"
import { createClient } from "@/lib/supabase/client" // Imported from updates
import { checkMembershipStatus } from "@/app/actions/stripe" // Added membership check import
import { fetchUserAddresses } from "@/app/actions/addresses" // Added fetchUserAddresses import
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog" // Import Dialog components properly
import { uploadFileViaAPI } from "@/app/actions/upload"
import { getTodayET, getDateOffsetET, getCurrentTimeET } from "@/lib/timezone" // Imported from updates
import { compressImage } from "@/lib/imageCompression"
import { upload } from "@vercel/blob/client"

const DISABLE_IMAGE_COMPRESSION = false

const STEPS = [
  { id: 1, title: "Schedule", icon: Calendar },
  { id: 2, title: "Address", icon: MapPin },
  { id: 3, title: "Pickup", icon: Hand },
  { id: 4, title: "Plan", icon: CreditCard },
  { id: 5, title: "Items", icon: Package },
  { id: 6, title: "Checkout", icon: Truck },
]

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "8–11am", label: "8–11am" },
  { value: "11am–2pm", label: "11am–2pm" },
  { value: "2–5pm", label: "2–5pm" },
  { value: "5–8pm", label: "5–8pm" },
]

const isTimeWindowPassed = (timeWindow: TimeWindow): boolean => {
  const { hour, minute } = getCurrentTimeET()
  const currentMinutes = hour * 60 + minute

  // Map time windows to their end hours in minutes from midnight
  const timeWindowEndMinutes: Record<TimeWindow, number> = {
    "8–11am": 11 * 60, // 11:00 AM
    "11am–2pm": 14 * 60, // 2:00 PM
    "2–5pm": 17 * 60, // 5:00 PM
    "5–8pm": 20 * 60, // 8:00 PM
  }

  const endMinutes = timeWindowEndMinutes[timeWindow]
  return endMinutes ? currentMinutes >= endMinutes : false
}

// CRITICAL: This function generates dates in Eastern Time (ET) timezone.
// The getDateOffsetET() utility returns dates as YYYY-MM-DD strings (e.g., "2025-12-17")
// in ET timezone. These date strings are then saved directly to the database without
// any timezone conversion. DO NOT modify the date format or add time components.
const generateDates = () => {
  const dates = []

  for (let i = 0; i < 7; i++) {
    // Get date in ET timezone - returns YYYY-MM-DD format
    const dateStr = getDateOffsetET(i)
    const date = new Date(dateStr + "T12:00:00") // Noon to avoid timezone issues

    const dayName = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" })
    const dayNum = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "America/New_York" })
    const isSunday = date.getDay() === 0
    const isToday = i === 0
    const isTomorrow = i === 1
    const isDayAfterTomorrow = i === 2

    dates.push({
      date: dateStr, // YYYY-MM-DD in ET
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

type SavedAddress = {
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

const SchedulePage = () => {
  const DEBUG_UPLOAD = process.env.NEXT_PUBLIC_DEBUG_UPLOAD === "true" // Changed DEBUG_UPLOAD to use environment variable instead of hardcoded value

  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showItemModal, setShowItemModal] = useState(false)
  const [debugFileInfo, setDebugFileInfo] = useState<string>("") // Added debug file info state
  // Update modalStep type to include specific detail steps
  const [modalStep, setModalStep] = useState<
    "select-type" | "has-label-details" | "email-pdf-details" | "amazon-qr-details" | "no-label-details"
  >("select-type")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [dates] = useState(generateDates)
  const [showPayment, setShowPayment] = useState(false)
  const [showInstantInfo, setShowInstantInfo] = useState(false) // Added from updates

  const [isMember, setIsMember] = useState(false)
  const [membershipChecked, setMembershipChecked] = useState(false)

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [saveThisAddress, setSaveThisAddress] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [addressConfirmed, setAddressConfirmed] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1 - Schedule
    selectedDate: "",
    timeWindow: "11am–2pm" as TimeWindow,
    isInstant: false,
    // Step 2 - Address
    name: "",
    phone: "",
    address: "",
    apt: "",
    buildingName: "",
    city: "New York",
    zip: "",
    notes: "",
    // Step 3 - Pickup Method
    pickupMethod: "hand-to-me" as PickupMethod,
    pickupInstructions: "",
    // Step 4 - Plan
    plan: "Pay-As-You-Go" as PlanType,
    // Step 5 - Items
    items: [] as ReturnItem[],
  })

  const [uploadedItems, setUploadedItems] = useState<any[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)

  const [newItem, setNewItem] = useState({
    type: "",
    labelType: "" as LabelType | "",
    retailer: "",
    description: "",
    trackingNumber: "",
    labelFile: null as File | null,
    packageSize: "small" as "small" | "medium" | "large",
    printOption: "print-for-me" as "print-for-me" | "will-print",
    isBoxed: true,
    needsHelp: false,
    orderNumber: "",
    returnPortalLink: "",
    proofFile: null as File | null,
    needsBox: true,
    returnTo: "",
    returnToOther: "",
    photoFile: null as File | null,
    file: null as File | null,
    needHelpGettingLabel: false,
    notes: "", // Added from updates
  })

  const validateFileSize = (file: File): string | null => {
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
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

  useEffect(() => {
    async function checkMembership() {
      try {
        const { isMember: memberStatus } = await checkMembershipStatus()
        setIsMember(memberStatus)
        if (memberStatus) {
          setFormData((prev) => ({ ...prev, plan: "Membership" }))
        }
      } catch (error) {
        console.error("Error checking membership:", error)
      } finally {
        setMembershipChecked(true)
      }
    }
    checkMembership()
  }, [])

  useEffect(() => {
    const user = localStorage.getItem("davidreturns_user")
    if (user) {
      const { email, name } = JSON.parse(user)
      setFormData((prev) => ({ ...prev, email, name: name || "" }))
    }
  }, [])

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const { addresses, error } = await fetchUserAddresses()

        if (error) {
          // No change needed here, error logging is fine as is.
        }

        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses)
          // Auto-select default address
          const defaultAddr = addresses.find((a: SavedAddress) => a.is_default) || addresses[0]
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id)
            populateFormFromAddress(defaultAddr)
            setAddressConfirmed(true)
          }
        } else {
          setShowAddressForm(true)
        }
      } else {
        setShowAddressForm(true)
      }
    }

    fetchSavedAddresses()
  }, [])

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
    setAddressConfirmed(true)
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
      // If it's 8pm or later (20:00+), instant pickup should be tomorrow
      if (currentHour >= 20) {
        setFormData((prev) => ({ ...prev, selectedDate: date, isInstant: false }))
        setError("It's too late for instant pickup today. Please select tomorrow or a future date.")
        return
      }

      setFormData((prev) => ({ ...prev, selectedDate: date, isInstant: true }))
      // Set default time to first available window
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
      type: "", // This type is not directly used in the newItem state anymore for modal logic
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
      notes: item.notes || "", // Added from updates
    })
    // Set the correct modal step based on label type
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
    // Validation for required fields based on labelType
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

    // Specific validation for file uploads based on labelType
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
    // Add validation for retailer in amazon-qr case
    if (newItem.labelType === "amazon-qr" && !newItem.retailer) {
      setError("Please select the retailer.")
      return
    }

    const item: ReturnItem = {
      id: editingItemId || Date.now().toString(), // Use existing ID if editing
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
      returnTo: newItem.returnTo === "Other" ? newItem.returnToOther : newItem.returnTo, // Handle 'Other' case
      file: newItem.file, // Include the uploaded file for digital/qr/no-label types
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

    // Reset editing state and modal state
    setEditingItemId(null)
    setNewItem({
      // Resetting newItem state
      type: "",
      labelType: "" as LabelType | "", // CHANGED: Reset labelType to empty string with proper type
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
      notes: "", // Reset from updates
    })
    setModalStep("select-type")
    setShowItemModal(false)
    setError("") // Clear any previous errors
  }

  const removeItem = (id: string) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }))
  }

  const calculateTotal = () => {
    if (isMember) {
      return {
        pickup: 0,
        items: 0,
        instant: 0,
        total: 0,
        isMembership: true,
        isExistingMember: true,
      }
    }

    if (formData.plan === "Membership") {
      return {
        pickup: 0,
        items: 0,
        instant: 0,
        total: 14.99,
        isMembership: true,
        isExistingMember: false,
      }
    }

    const pickup = 5
    const additionalItems = Math.max(0, formData.items.length - 1) * 2
    const instant = formData.isInstant ? 1.5 : 0

    const subtotal = pickup + additionalItems + instant

    return {
      pickup,
      items: additionalItems,
      instant,
      total: subtotal,
      isMembership: false,
      isExistingMember: false,
    }
  }

  const uploadFilesAndProceedToPayment = async () => {
    setIsUploadingFiles(true)
    setError("")
    if (DEBUG_UPLOAD) {
      setDebugFileInfo("") // Clear previous debug info
    }

    try {
      // Validate file sizes first
      for (const item of formData.items) {
        if (item.file) {
          const error = validateFileSize(item.file)
          if (error) {
            throw new Error(error)
          }
        }
        if (item.photoFile) {
          const error = validateFileSize(item.photoFile)
          if (error) {
            throw new Error(error)
          }
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

            // Check if we need to compress the image
            let fileToUpload = item.file
            const isImage = item.file.type.startsWith("image/") || item.file.name.match(/\.(heic|heif|jpg|jpeg|png)$/i) // Added check for common image extensions

            if (isImage && !DISABLE_IMAGE_COMPRESSION) {
              if (DEBUG_UPLOAD) {
                setDebugFileInfo((prev) => `${prev}\n\n🔄 Attempting image compression...`)
              }
              try {
                fileToUpload = await compressImage(item.file, 4) // Assuming compressImage returns the compressed file
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
                fileToUpload = item.file // Fallback to original file
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
              const blob = await upload(fileToUpload.name, fileToUpload, {
                access: "public",
                handleUploadUrl: "/api/blob-upload",
                clientPayload: JSON.stringify({ addRandomSuffix: true }),
              })

              labelFileUrl = blob.url
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
                  `${prev}\n\n📸 Photo file selected: ${item.photoFile.name}\nType: ${item.photoFile.type}\nSize: ${(item.photoFile.size / 1024 / 1024).toFixed(2)}MB`,
              )
            }

            let photoToUpload = item.photoFile
            const isPhotoImage =
              item.photoFile.type.startsWith("image/") || item.photoFile.name.match(/\.(heic|heif|jpg|jpeg|png)$/i) // Added check for common image extensions

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
                photoToUpload = item.photoFile // Fallback to original file
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
              const photoBlob = await upload(photoToUpload.name, photoToUpload, {
                access: "public",
                handleUploadUrl: "/api/blob-upload",
                clientPayload: JSON.stringify({ addRandomSuffix: true }),
              })

              photoFileUrl = photoBlob.url
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

          const uploadedItem = {
            description: item.description,
            retailer: item.retailer,
            labelType: item.labelType,
            packageSize: item.packageSize,
            photoUrl: photoFileUrl,
            printOption: item.printOption,
            isBoxed: item.isBoxed,
            orderNumber: item.orderNumber,
            returnPortalLink: item.returnPortalLink,
            needHelpGettingLabel: item.needHelpGettingLabel,
            labelFileUrl: labelFileUrl,
            needsBox: item.needsBox,
            returnTo: item.returnTo,
            notes: item.notes,
          }

          return uploadedItem
        }),
      )

      setUploadedItems(itemsWithUrls)

      setError("")
      setShowPayment(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload files. Please try again."
      setError(errorMsg)
      if (DEBUG_UPLOAD) {
        // Wrap debug logging in DEBUG_UPLOAD checks
        setDebugFileInfo((prev) => `${prev}\n\n❗ FINAL ERROR: ${errorMsg}`)
        console.error("Error during file upload process:", err)
      }
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.selectedDate && formData.timeWindow
      case 2:
        if (showAddressForm) {
          return formData.name && formData.phone && formData.address && formData.zip
        } else {
          // If not showing form, just need an address selected OR if an address is currently being entered and is valid
          return selectedAddressId !== null || (formData.name && formData.phone && formData.address && formData.zip)
        }
      case 3:
        return formData.pickupMethod
      case 4:
        return formData.plan
      case 5:
        return formData.items.length > 0
      case 6:
        return true
      default:
        return false
    }
  }

  const saveNewAddress = async () => {
    if (!userId) return false // Return false if userId is not available

    const supabase = createClient()
    const { data, error } = await supabase
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
      setShowAddressForm(false)
      setAddressConfirmed(false) // Reset confirmation so it shows the selected address UI
      return true // Indicate success
    }
    console.error("Failed to save new address:", error) // Log error for debugging
    return false // Indicate failure
  }

  const handleSubmit = async () => {
    console.log("[v0] ===== FORM SUBMISSION STARTED =====")
    console.log("[v0] isSubmitting before:", isSubmitting)
    
    if (isSubmitting) {
      console.log("[v0] Already submitting, preventing double submission")
      return
    }
    
    setError("")
    setIsSubmitting(true)

    try {
      let addressSaved = false
      // Only attempt to save if the address form is shown, saveThisAddress is checked, and no address is selected yet
      if (showAddressForm && saveThisAddress && userId && !selectedAddressId) {
        addressSaved = await saveNewAddress()
        if (!addressSaved) {
          throw new Error("Failed to save new address.")
        }
      }

      const orderData = {
        pickupDate: formData.selectedDate,
        pickupTime: formData.timeWindow,
        address: {
          fullName: formData.name,
          phone: formData.phone,
          street: formData.address,
          apt: formData.apt || undefined,
          city: formData.city,
          zip: formData.zip,
          notes: formData.notes || undefined,
          buildingName: formData.buildingName || undefined,
        },
        pickupMethod: formData.pickupMethod,
        pickupInstructions: formData.pickupInstructions, // Added from updates
        items: formData.items.map((item) => ({
          labelType: item.labelType,
          description: item.description,
          retailer: item.retailer || undefined,
          packageSize: item.packageSize,
          needsBox: item.needsBox,
          returnTo: item.returnTo || undefined,
          notes: item.notes, // Added from updates
        })),
        plan: formData.plan,
        isInstant: formData.isInstant,
      }

      localStorage.setItem("pendingOrder", JSON.stringify(orderData))

      const uploadedItems = await Promise.all(
        formData.items.map(async (item) => {
          let labelFileUrl = null
          let photoFileUrl = null

          // Upload label/QR file if exists
          if (item.file) {
            const blob = await uploadFileViaAPI(item.file) // Changed from uploadLabelFile
            labelFileUrl = blob.url
          }

          // Upload photo file if exists
          if (item.photoFile) {
            const blob = await uploadFileViaAPI(item.photoFile) // Changed from uploadLabelFile
            photoFileUrl = blob.url
          }

          const uploadedItem = {
            description: item.description,
            retailer: item.retailer,
            labelType: item.labelType,
            packageSize: item.packageSize,
            photoUrl: photoFileUrl,
            printOption: item.printOption,
            isBoxed: item.isBoxed,
            orderNumber: item.orderNumber,
            returnPortalLink: item.returnPortalLink,
            needHelpGettingLabel: item.needHelpGettingLabel,
            labelFileUrl: labelFileUrl,
            needsBox: item.needsBox,
            returnTo: item.returnTo,
            notes: item.notes, // Added from updates
          }

          return uploadedItem
        }),
      )

      setUploadedItems(uploadedItems) // This is likely redundant if uploadFilesAndProceedToPayment is called directly

      console.log("[v0] Calling /api/pickups to create order and checkout session")
      const response = await fetch("/api/pickups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: localStorage.getItem("davidreturns_user")
            ? JSON.parse(localStorage.getItem("davidreturns_user")!).email
            : "",
          phone: formData.phone,
          address: formData.apt ? `${formData.address}, ${formData.apt}` : formData.address,
          buildingName: formData.buildingName,
          city: formData.city,
          zip: formData.zip,
          retailer:
            formData.items
              .map((i) => i.retailer)
              .filter(Boolean)
              .join(", ") || "Various",
          itemsDescription: formData.items.map((i) => i.description).join("; "),
          // Logic for returnType needs to be re-evaluated based on new item flow
          returnType:
            formData.items[0]?.labelType === "has-label"
              ? "Pre-labeled package ready"
              : formData.items[0]?.labelType === "no-label"
                ? "Need us to bring label"
                : "Email/PDF label",
          preferredDate: formData.selectedDate,
          timeWindow: formData.timeWindow,
          notes: formData.notes,
          pickupInstructions: formData.pickupInstructions, // Added from updates
          plan: formData.plan,
          numPackages: formData.items.length,
          serviceType: formData.isInstant ? "Instant" : "Standard",
          pickupMethod: formData.pickupMethod,
          // Include new item details in the submission if needed by the API
          itemsDetails: uploadedItems, // Use uploaded items with real URLs
        }),
      })

      if (!response.ok) {
        console.log("[v0] API response not OK:", response.status)
        const data = await response.json()
        console.log("[v0] Error data:", data)
        throw new Error(data.error || "Something went wrong")
      }

      console.log("[v0] Order created successfully, setting success state")
      setIsSuccess(true)
    } catch (err) {
      console.log("[v0] Error during submission:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      console.log("[v0] Setting isSubmitting to false")
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowItemModal(false)
    setModalStep("select-type")
    setEditingItemId(null) // Reset editing state
    setNewItem({
      // Resetting newItem state
      type: "",
      labelType: "" as LabelType | "", // Reset labelType
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
      notes: "", // Reset from updates
    })
  }

  // This function was previously inside the Dialog Content for the item modal,
  // but now it's moved outside to handle the modal's state transitions.
  const handleItemModalOpenChange = (open: boolean) => {
    setShowItemModal(open)
    if (!open) {
      setEditingItemId(null)
      setModalStep("select-type")
      // Reset newItem state when modal is closed
      setNewItem({
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
        notes: "", // Reset from updates
      })
    }
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">You're all set!</h1>
          <p className="mt-3 text-lg text-muted-foreground">We'll confirm your pickup by text shortly.</p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
            <h3 className="font-medium text-foreground">Pickup details</h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">Date:</span> {(() => {
                  const [year, month, day] = formData.selectedDate.split("-").map(Number)
                  const localDate = new Date(year, month - 1, day)
                  return localDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                })()}
              </p>
              <p>
                <span className="text-foreground font-medium">Time:</span> {formData.timeWindow}
              </p>
              <p>
                <span className="text-foreground font-medium">Items:</span> {formData.items.length} package
                {formData.items.length > 1 ? "s" : ""}
              </p>
              {formData.isInstant && (
                <p className="flex items-center gap-1.5 text-orange-600">
                  <Zap className="h-4 w-4" /> Instant pickup
                </p>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            {/* </CHANGE> */}
            <Link href="/">
              <Image
                src="/images/david-returns-logo.png"
                alt="David Returns"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center gap-1.5 transition-all ${
                    step.id === currentStep
                      ? "text-foreground"
                      : step.id < currentStep
                        ? "text-orange-500 cursor-pointer hover:opacity-80"
                        : "text-muted-foreground/50 cursor-not-allowed"
                  } ${step.id <= currentStep ? "cursor-pointer" : ""}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      step.id === currentStep
                        ? "bg-foreground text-background"
                        : step.id < currentStep
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? <Truck className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </button>
                {/* </CHANGE> */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-8 sm:w-12 transition-colors ${
                      step.id < currentStep ? "bg-orange-500" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4">
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 shadow-lg">
              {error}
            </div>
          </div>
        )}
        {/* </CHANGE> */}

        {/* Step 1 - Schedule */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">When should we pick up?</h1>
              <p className="mt-2 text-muted-foreground">Choose a date and time that works for you.</p>
            </div>

            {/* Date Selection */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Select a date</h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {dates.map((date) => {
                  const now = new Date()
                  const currentHour = now.getHours()
                  const isTodayDisabled = date.isToday && currentHour >= 20
                  const isPopular = currentHour >= 20 ? date.isDayAfterTomorrow : date.isTomorrow

                  return (
                    <button
                      key={date.date}
                      onClick={() => !date.isSunday && !isTodayDisabled && handleDateSelect(date.date, date.isToday)}
                      disabled={date.isSunday || isTodayDisabled}
                      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-3 sm:p-4 transition-all min-h-[100px] sm:min-h-[110px] ${
                        date.isSunday || isTodayDisabled
                          ? "border-border bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50"
                          : formData.selectedDate === date.date
                            ? "border-foreground bg-foreground text-background shadow-lg"
                            : "border-border bg-card hover:border-muted-foreground hover:shadow-md"
                      }`}
                    >
                      {date.isToday && !isTodayDisabled && (
                        <span
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            formData.selectedDate === date.date
                              ? "bg-orange-500 text-white"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          <Zap className="h-3 w-3" />
                          +$1.50
                        </span>
                      )}
                      {isPopular && !date.isSunday && (
                        <span
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            formData.selectedDate === date.date
                              ? "bg-emerald-500 text-white"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          Popular
                        </span>
                      )}
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={`text-xs font-medium ${
                            formData.selectedDate === date.date ? "text-background/70" : "text-muted-foreground"
                          }`}
                        >
                          {date.label}
                        </span>
                        <span className="text-xl sm:text-2xl font-semibold">{date.dayNum}</span>
                        <span
                          className={`text-xs ${
                            formData.selectedDate === date.date ? "text-background/70" : "text-muted-foreground"
                          }`}
                        >
                          {date.month}
                        </span>
                        {(date.isSunday || isTodayDisabled) && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {date.isSunday ? "No pickups" : "Too late"}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {formData.isInstant && (
                <p className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                  <Zap className="h-4 w-4" /> Instant same-day pickup — $1.50 fee applies
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Select a time window</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIME_WINDOWS.map((time) => {
                  // Use getTodayET() for comparison
                  const isActuallyToday = formData.selectedDate === getTodayET()
                  const isPassed = isActuallyToday && isTimeWindowPassed(time.value)

                  return (
                    <button
                      key={time.value}
                      onClick={() => !isPassed && setFormData((prev) => ({ ...prev, timeWindow: time.value }))}
                      disabled={isPassed}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                        isPassed
                          ? "border-border bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50"
                          : formData.timeWindow === time.value
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{time.label}</span>
                    </button>
                  )
                })}
              </div>
              {formData.selectedDate === getTodayET() && TIME_WINDOWS.some((tw) => isTimeWindowPassed(tw.value)) && (
                <p className="mt-3 text-xs text-muted-foreground">Past time windows are disabled for instant pickup</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2 - Address */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Where should we pick up?</h1>
              <p className="mt-2 text-muted-foreground">
                {savedAddresses.length > 0 && addressConfirmed
                  ? "Confirm your pickup address or choose a different one."
                  : "Enter your pickup address and contact info."}
              </p>
            </div>

            {savedAddresses.length > 0 && addressConfirmed && !showAddressForm && selectedAddressId && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-orange-500 bg-orange-50 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-orange-500 p-2 text-white">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{formData.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formData.address}
                          {formData.apt ? `, ${formData.apt}` : ""}, {formData.city} {formData.zip}
                        </p>
                        <p className="text-sm text-muted-foreground">{formData.phone}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressConfirmed(false)
                      }}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  This is your saved address. Click continue to proceed.
                </p>
              </div>
            )}

            {/* Show saved addresses list when user clicks "Change" or if no address is confirmed */}
            {savedAddresses.length > 0 && !addressConfirmed && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Saved Addresses</label>
                <div className="grid gap-3">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                        selectedAddressId === addr.id
                          ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                          : "border-border bg-card hover:border-foreground/30"
                      }`}
                    >
                      <div
                        className={`mt-0.5 rounded-full p-2 ${
                          selectedAddressId === addr.id ? "bg-orange-500 text-white" : "bg-muted"
                        }`}
                      >
                        {addr.label.toLowerCase().includes("work") ? (
                          <Building className="h-4 w-4" />
                        ) : (
                          <Home className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{addr.label}</span>
                          {addr.is_default && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {addr.street_address}
                          {addr.apt ? `, ${addr.apt}` : ""}, {addr.city} {addr.zip}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.full_name} • {addr.phone}
                        </p>
                      </div>
                      {selectedAddressId === addr.id && <Check className="h-5 w-5 text-orange-500" />}
                    </button>
                  ))}

                  {/* Add new address button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(null)
                      setShowAddressForm(true)
                      setAddressConfirmed(false) // Reset confirmation when showing form
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
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Use a different address</span>
                  </button>
                </div>
              </div>
            )}

            {/* Address form - show if no saved addresses or adding new */}
            {(showAddressForm || savedAddresses.length === 0) && (
              <div className="space-y-5">
                {savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">New Address</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false)
                        setAddressConfirmed(true) // Set confirmed to true when cancelling form
                        if (savedAddresses.length > 0) {
                          const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0]
                          if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.id)
                            populateFormFromAddress(defaultAddr)
                          }
                        }
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Full name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Mobile number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Street address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Apt / Unit <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.apt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, apt: e.target.value }))}
                      placeholder="4B"
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">ZIP code</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value }))}
                      placeholder="10001"
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Building name <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.buildingName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, buildingName: e.target.value }))}
                    placeholder="e.g. The Avalon, Empire State Building"
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Building access notes <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Gate code, doorman instructions, etc."
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
                  />
                </div>

                {userId && !selectedAddressId && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveThisAddress}
                      onChange={(e) => setSaveThisAddress(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="saveAddress" className="text-sm text-muted-foreground">
                      Save this address for future pickups
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3 - Pickup Method */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">How should we pick up?</h1>
              <p className="mt-2 text-muted-foreground">Choose how you'd like to hand off your packages.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setFormData((prev) => ({ ...prev, pickupMethod: "hand-to-me" }))}
                className={`flex flex-col items-center gap-4 rounded-2xl border-2 p-8 transition-all ${
                  formData.pickupMethod === "hand-to-me"
                    ? "border-foreground bg-foreground text-background shadow-lg"
                    : "border-border bg-card hover:border-muted-foreground hover:shadow-md"
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    formData.pickupMethod === "hand-to-me" ? "bg-background/20" : "bg-secondary"
                  }`}
                >
                  <Hand className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Hand it to us</h3>
                  <p
                    className={`mt-1 text-sm ${
                      formData.pickupMethod === "hand-to-me" ? "text-background/70" : "text-muted-foreground"
                    }`}
                  >
                    We'll knock or ring when we arrive
                  </p>
                </div>
              </button>

              <button
                onClick={() => setFormData((prev) => ({ ...prev, pickupMethod: "leave-at-door" }))}
                className={`flex flex-col items-center gap-4 rounded-2xl border-2 p-8 transition-all ${
                  formData.pickupMethod === "leave-at-door"
                    ? "border-foreground bg-foreground text-background shadow-lg"
                    : "border-border bg-card hover:border-muted-foreground hover:shadow-md"
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    formData.pickupMethod === "leave-at-door" ? "bg-background/20" : "bg-secondary"
                  }`}
                >
                  <DoorOpen className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Leave at my door</h3>
                  <p
                    className={`mt-1 text-sm ${
                      formData.pickupMethod === "leave-at-door" ? "text-background/70" : "text-muted-foreground"
                    }`}
                  >
                    Place packages outside and we'll grab them
                  </p>
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="pickupInstructions" className="block text-sm font-medium text-foreground">
                Pickup instructions (optional)
              </label>
              <textarea
                id="pickupInstructions"
                value={formData.pickupInstructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, pickupInstructions: e.target.value }))}
                placeholder="Building code, apartment #, front desk instructions, etc."
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Help our courier: building codes, apartment numbers, gate codes, special instructions, etc.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" />
              All pickups are photo-verified for your peace of mind.
            </div>
          </div>
        )}

        {/* Step 4 - Plan */}
        {currentStep === 4 && !isMember && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Choose your plan</h1>
              <p className="mt-2 text-muted-foreground">Select the option that works best for you.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setFormData((prev) => ({ ...prev, plan: "Pay-As-You-Go" }))}
                className={`relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all ${
                  formData.plan === "Pay-As-You-Go"
                    ? "border-foreground bg-card shadow-lg"
                    : "border-border bg-card hover:border-muted-foreground hover:shadow-md"
                }`}
              >
                {formData.plan === "Pay-As-You-Go" && (
                  <div className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">One-time pickup</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-foreground">$5</span>
                  <span className="text-muted-foreground"> per pickup</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">+ $2 per additional package</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Free label printing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Free shipping boxes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> No per-pickup fees
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" /> Cancel anytime
                  </li>
                </ul>
              </button>

              <button
                onClick={() => setFormData((prev) => ({ ...prev, plan: "Membership" }))}
                className={`relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all ${
                  formData.plan === "Membership"
                    ? "border-orange-500 bg-card shadow-lg ring-2 ring-orange-500/20"
                    : "border-border bg-card hover:border-muted-foreground hover:shadow-md"
                }`}
              >
                <span className="absolute -top-3 left-4 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-medium text-white">
                  Best value
                </span>
                {formData.plan === "Membership" && (
                  <div className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">Unlimited</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-foreground">$14.99</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                <p className="mt-1 text-sm text-orange-600 font-medium">Unlimited pickups & packages</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Free label printing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Free shipping boxes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Priority scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" /> Cancel anytime
                  </li>
                </ul>
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && isMember && (
          <div className="space-y-8">
            <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">You're all set!</h2>
              <p className="text-muted-foreground mb-6">
                Your unlimited membership covers this pickup at no additional cost.
              </p>
              <button
                onClick={() => setCurrentStep(5)}
                className="rounded-full bg-green-600 px-8 py-3 text-sm font-medium text-white hover:bg-green-700"
              >
                Continue to items
              </button>
            </div>
          </div>
        )}

        {/* Step 5 - Items */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">What are you returning?</h1>
              <p className="mt-2 text-muted-foreground">Add each item you'd like us to pick up.</p>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => editItem(item)}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.labelType === "has-label" && "Has printed label"}
                          {item.labelType === "email-pdf" && "Email/PDF label"}
                          {item.labelType === "amazon-qr" && "Amazon QR code"}
                          {item.labelType === "no-label" && "Need us to get label"}
                          {item.retailer && ` • ${item.retailer}`}
                          {item.needsBox === false && " (No box needed)"} {/* Display if no box is needed */}
                          {item.returnTo && ` • Drop off: ${item.returnTo}`} {/* Display return destination */}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent edit when clicking delete
                        removeItem(item.id)
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Item Button */}
            <button
              onClick={() => {
                setEditingItemId(null)
                setModalStep("select-type")
                setNewItem({
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
                  notes: "", // Reset from updates
                })
                setShowItemModal(true)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Add item</span>
            </button>
          </div>
        )}

        {/* Step 6 - Checkout */}
        {currentStep === 6 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Confirm your pickup</h1>
              <p className="mt-2 text-muted-foreground">Review your details before confirming.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pickup Summary */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Pickup details</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground font-medium">
                        {(() => {
                          const [year, month, day] = formData.selectedDate.split("-").map(Number)
                          const localDate = new Date(year, month - 1, day)
                          return localDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        })()}
                        {formData.isInstant && <span className="ml-2 text-orange-500">(Instant)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="text-foreground font-medium">{formData.timeWindow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="text-foreground font-medium">
                        {formData.pickupMethod === "hand-to-me" ? "Hand to us" : "Leave at door"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Address</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                  </div>
                  <div className="mt-4 text-sm">
                    <p className="font-medium text-foreground">{formData.name}</p>
                    <p className="text-muted-foreground">
                      {formData.address}
                      {formData.apt && `, ${formData.apt}`}
                    </p>
                    <p className="text-muted-foreground">
                      {formData.city}, NY {formData.zip}
                    </p>
                    <p className="text-muted-foreground mt-1">{formData.phone}</p>
                    {formData.buildingName && (
                      <p className="text-muted-foreground">Building: {formData.buildingName}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Items ({formData.items.length})</h3>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2 text-muted-foreground">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
                          {index + 1}
                        </span>
                        {item.description}
                        {item.needsBox === false && <span className="text-xs text-emerald-600">(No box needed)</span>}{" "}
                        {/* Display no box needed info */}
                        {item.returnTo && ` (Drop off: ${item.returnTo})`} {/* Display return destination */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Receipt */}
              <div>
                <div className="rounded-2xl border border-border bg-card p-6 sticky top-32">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Order summary</h2>

                  {isMember && (
                    <div className="mb-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 flex-shrink-0">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">Thank you for being a loyal member!</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This pickup is completely free with your unlimited membership.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    {isMember ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unlimited membership</span>
                          <span className="text-emerald-600 font-medium">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">This pickup</span>
                          <span className="text-emerald-600 font-medium">FREE</span>
                        </div>
                        {formData.isInstant && (
                          <div className="flex justify-between">
                            <span className="text-orange-600 flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5" /> Instant pickup
                            </span>
                            <span className="text-emerald-600 font-medium">FREE</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-3 mt-3">
                          <div className="flex justify-between text-base">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="font-semibold text-emerald-600">$0.00</span>
                          </div>
                        </div>
                      </>
                    ) : calculateTotal().isMembership ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unlimited membership</span>
                          <span className="text-foreground font-medium">$14.99/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">This pickup</span>
                          <span className="text-emerald-600 font-medium">FREE</span>
                        </div>
                        <div className="border-t border-border pt-3 mt-3">
                          <div className="flex justify-between text-base">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="font-semibold text-foreground">${calculateTotal().total.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pickup fee</span>
                          <span className="text-foreground font-medium">${calculateTotal().pickup.toFixed(2)}</span>
                        </div>
                        {calculateTotal().items > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Additional items ({formData.items.length - 1})
                            </span>
                            <span className="text-foreground font-medium">${calculateTotal().items.toFixed(2)}</span>
                          </div>
                        )}
                        {!isMember && formData.isInstant && (
                          <div className="flex justify-between">
                            <span className="text-orange-600 flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5" /> Instant pickup
                            </span>
                            <span className="text-orange-600 font-medium">${calculateTotal().instant.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-3 mt-3">
                          <div className="flex justify-between text-base">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="font-semibold text-foreground">${calculateTotal().total.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {formData.plan === "Pay-As-You-Go" && !calculateTotal().isExistingMember && (
                    <div className="mt-6 rounded-xl bg-orange-50 border border-orange-100 p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Save with Unlimited</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Get unlimited pickups for just $14.99/mo
                          </p>
                          <button
                            onClick={() => setFormData((prev) => ({ ...prev, plan: "Membership" }))}
                            className="text-xs font-medium text-orange-600 hover:text-orange-700 mt-2"
                          >
                            Upgrade now →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replace the confirm pickup button section in step 6 */}
                  {!showPayment ? (
                    <>
                      <button
                        onClick={() => {
                          // Only proceed if address is confirmed or explicitly saved
                          if (currentStep === 2 && !addressConfirmed && !showAddressForm) {
                            setError("Please select an address or fill in the form.")
                            return
                          }
                          uploadFilesAndProceedToPayment()
                        }}
                        disabled={isUploadingFiles}
                        className="mt-6 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {isUploadingFiles ? "Uploading files..." : "Proceed to payment"}
                      </button>

                      <p className="mt-4 text-center text-xs text-muted-foreground">
                        By confirming, you agree to our Terms of Service
                      </p>
                    </>
                  ) : (
                    <div className="mt-6">
                      <StripeCheckout
                        plan={formData.plan}
                        itemCount={formData.items.length}
                        isInstant={formData.isInstant}
                        pickupDate={formData.selectedDate}
                        pickupTime={formData.timeWindow}
                        pickupMethod={formData.pickupMethod}
                        address={{
                          fullName: formData.name,
                          phone: formData.phone,
                          street: formData.address,
                          apt: formData.apt,
                          city: formData.city,
                          zip: formData.zip,
                          notes: formData.notes,
                          pickupInstructions: formData.pickupInstructions,
                        }}
                        items={uploadedItems}
                        onBack={() => setShowPayment(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="mt-10 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => {
                if (currentStep === 2 && !addressConfirmed && !showAddressForm) {
                  setError("Please select an address or fill in the form.")
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

                if (currentStep === 2 && showAddressForm && saveThisAddress && userId && !selectedAddressId) {
                  saveNewAddress().then((saved) => {
                    if (!saved) {
                      setError("Failed to save address. Please try again.")
                    }
                    // Don't advance step - address is saved and form is hidden by saveNewAddress
                  })
                  return
                }

                if (currentStep === 2 && showAddressForm && !selectedAddressId) {
                  setShowAddressForm(false)
                  setAddressConfirmed(true)
                  // Don't advance - stay on address step to show the address in selection view
                  return
                }

                setCurrentStep((prev) => prev + 1)
              }}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Item Modal */}
      <Dialog open={showItemModal} onOpenChange={handleItemModalOpenChange}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogTitle className="sr-only">Add Return Item</DialogTitle>
          {/* Modal Header */}
          <div className="flex items-center gap-3">
            {/* Conditionally show back button based on modalStep */}
            {(modalStep === "has-label-details" ||
              modalStep === "email-pdf-details" ||
              modalStep === "amazon-qr-details" ||
              modalStep === "no-label-details") && (
              <button
                onClick={() => {
                  setModalStep("select-type")
                  setEditingItemId(null)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {modalStep === "select-type"
                ? "What type of return label do you have?"
                : newItem.labelType === "has-label"
                  ? "✓ Great! Make sure your printed label is attached to your package."
                  : newItem.labelType === "email-pdf"
                    ? "Upload your digital return label."
                    : newItem.labelType === "amazon-qr"
                      ? "Upload your QR code."
                      : "We'll help you get a return label."}
            </h2>
          </div>

          {/* Step 1: Select Label Type */}
          {modalStep === "select-type" && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">Choose the option that matches your return method.</p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setNewItem((prev) => ({ ...prev, labelType: "has-label" }))
                    setModalStep("has-label-details")
                  }}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-foreground hover:shadow-md transition-all aspect-square"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-stone-600"
                    >
                      <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2z" />
                      <path d="M7 7h10M7 12h10M7 17h6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Physical label</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Already attached</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setNewItem((prev) => ({ ...prev, labelType: "email-pdf" }))
                    setModalStep("email-pdf-details")
                  }}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-foreground hover:shadow-md transition-all aspect-square"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Digital label</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">PDF, email, or screenshot</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setNewItem((prev) => ({ ...prev, labelType: "amazon-qr" }))
                    setModalStep("amazon-qr-details")
                  }}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-foreground hover:shadow-md transition-all aspect-square"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-orange-500"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="3" height="3" rx="0.5" />
                      <rect x="18" y="14" width="3" height="3" rx="0.5" />
                      <rect x="14" y="18" width="3" height="3" rx="0.5" />
                      <rect x="18" y="18" width="3" height="3" rx="0.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">QR code</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Amazon, Kohl's, etc.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {modalStep === "has-label-details" && (
            <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
              <div className="rounded-xl bg-green-50 border-2 border-green-500 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Important: Have your printed label ready
                    </p>
                    <p className="text-sm text-green-800">
                      Our courier will pick up your package and drop it off using the label you've attached.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  What are you returning? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Blue sneakers, size 10"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Where should we drop it off? <span className="text-red-500">*</span>
                </label>
                <select
                  value={newItem.returnTo}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      returnTo: e.target.value,
                      returnToOther: e.target.value !== "Other" ? "" : prev.returnToOther,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                >
                  <option value="">Select drop-off location</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="USPS">USPS</option>
                  <option value="Amazon Locker">Amazon Locker</option>
                  <option value="Other">Other</option>
                </select>
                {newItem.returnTo === "Other" && (
                  <input
                    type="text"
                    value={newItem.returnToOther}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, returnToOther: e.target.value }))}
                    placeholder="Enter drop-off location"
                    className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Package size <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setNewItem((prev) => ({ ...prev, packageSize: size }))}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        newItem.packageSize === size
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{size}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {size === "small" && "Shoebox or smaller"}
                        {size === "medium" && "Standard box"}
                        {size === "large" && "Large box"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Additional notes <span className="text-muted-foreground">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Order number, return code, account number, or special instructions
                </p>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Order #12345, Handle with care, Amazon account: john@email.com"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Upload photo of package <span className="text-muted-foreground">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">Recommended so we can identify your package</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setNewItem((prev) => ({ ...prev, photoFile: file }))
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-4 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
                  >
                    {newItem.photoFile ? (
                      <div className="flex items-center gap-2 text-foreground w-full justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="font-medium">{newItem.photoFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setNewItem((prev) => ({ ...prev, photoFile: null }))
                            const input = document.getElementById("photo-upload") as HTMLInputElement
                            if (input) input.value = ""
                          }}
                          className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                          aria-label="Remove photo"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        <span>Click to upload photo</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needsBox"
                  checked={!newItem.needsBox}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, needsBox: !e.target.checked }))}
                  className="h-4 w-4 rounded border-border text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="needsBox" className="text-sm font-medium text-foreground flex items-center gap-2">
                  I have my own box
                </label>
              </div>
            </div>
          )}

          {modalStep === "email-pdf-details" && (
            <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">We'll print your label</span> and attach it securely to your package.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Upload your label <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">PNG, JPG, PDF, or iPhone photos • Max 5MB</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      if (file) {
                        const error = validateFileSize(file)
                        if (error) {
                          setError(error)
                          e.target.value = ""
                          return
                        }
                      }
                      setNewItem((prev) => ({ ...prev, file }))
                    }}
                    className="hidden"
                    id="label-upload-digital"
                  />
                  <label
                    htmlFor="label-upload-digital"
                    className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
                  >
                    {newItem.file ? (
                      <div className="flex items-center gap-2 text-foreground w-full justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="font-medium">{newItem.file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(newItem.file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setNewItem((prev) => ({ ...prev, file: null }))
                            const input = document.getElementById("label-upload-digital") as HTMLInputElement
                            if (input) input.value = ""
                          }}
                          className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                          aria-label="Remove label file"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span>Click to upload label file</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: If your PDF is too large, take a screenshot instead
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  What are you returning? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Blue sneakers, size 10"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Where should we drop it off? <span className="text-red-500">*</span>
                </label>
                <select
                  value={newItem.returnTo}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      returnTo: e.target.value,
                      returnToOther: e.target.value !== "Other" ? "" : prev.returnToOther,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                >
                  <option value="">Select drop-off location</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="USPS">USPS</option>
                  <option value="Amazon Locker">Amazon Locker</option>
                  <option value="Other">Other</option>
                </select>
                {newItem.returnTo === "Other" && (
                  <input
                    type="text"
                    value={newItem.returnToOther}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, returnToOther: e.target.value }))}
                    placeholder="Enter drop-off location"
                    className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Package size <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setNewItem((prev) => ({ ...prev, packageSize: size }))}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        newItem.packageSize === size
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{size}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Additional notes <span className="text-muted-foreground">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Order number, return code, account number, or special instructions
                </p>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Order #12345, Handle with care, Amazon account: john@email.com"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
                />
              </div>
            </div>
          )}

          {modalStep === "no-label-details" && (
            <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">If you're missing a label,</span> we can help generate one so your
                  return can be completed.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Retailer name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.retailer}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, retailer: e.target.value }))}
                  placeholder="e.g. Nike, Zara, Nordstrom"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Order number <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newItem.orderNumber}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, orderNumber: e.target.value }))}
                  placeholder="e.g. ORD-123456"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Upload proof of purchase <span className="text-muted-foreground">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  Receipt, order confirmation, or packing slip
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setNewItem((prev) => ({ ...prev, file }))
                    }}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-4 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
                  >
                    {newItem.file ? (
                      <div className="flex items-center gap-2 text-foreground w-full justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="font-medium">{newItem.file.name}</span>
                        </div>
                        {/* Added remove button for uploaded proof file */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setNewItem((prev) => ({ ...prev, file: null }))
                            const input = document.getElementById("proof-upload") as HTMLInputElement
                            if (input) input.value = ""
                          }}
                          className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                          aria-label="Remove proof file"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span>Click to upload file</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Return portal link <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="url"
                  value={newItem.returnPortalLink}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, returnPortalLink: e.target.value }))}
                  placeholder="https://returns.retailer.com/..."
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Do you want us to request a return label for you?
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewItem((prev) => ({ ...prev, needHelpGettingLabel: true }))}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${
                      newItem.needHelpGettingLabel
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <span className="text-sm font-medium">Yes, please help</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItem((prev) => ({ ...prev, needHelpGettingLabel: false }))}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${
                      !newItem.needHelpGettingLabel
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <span className="text-sm font-medium">No, I'll get it</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  What are you returning? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Blue sneakers, size 10"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Package size <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setNewItem((prev) => ({ ...prev, packageSize: size }))}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        newItem.packageSize === size
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{size}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Additional notes <span className="text-muted-foreground">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Order number, account number, return reason, or any info we need to get your label
                </p>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Order #12345, Reason: Wrong size, Customer ID: ABC123"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
                />
              </div>
            </div>
          )}

          {modalStep === "amazon-qr-details" && (
            <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Scan and go!</span> We'll help you get your QR code ready for the
                  carrier.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Retailer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.retailer}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, retailer: e.target.value }))}
                  placeholder="e.g. Amazon, Zappos, Nordstrom"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Upload your QR code <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">PNG, JPG, PDF, or iPhone photos • Max 5MB</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      if (file) {
                        const error = validateFileSize(file)
                        if (error) {
                          setError(error)
                          e.target.value = ""
                          return
                        }
                      }
                      setNewItem((prev) => ({ ...prev, file }))
                    }}
                    className="hidden"
                    id="qr-code-upload"
                  />
                  <label
                    htmlFor="qr-code-upload"
                    className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
                  >
                    {newItem.file ? (
                      <div className="flex items-center gap-2 text-foreground w-full justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="font-medium">{newItem.file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(newItem.file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setNewItem((prev) => ({ ...prev, file: null }))
                            const input = document.getElementById("qr-code-upload") as HTMLInputElement
                            if (input) input.value = ""
                          }}
                          className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                          aria-label="Remove QR code file"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span>Click to upload QR code</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  What are you returning? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. T-shirt, size M"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Package size <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setNewItem((prev) => ({ ...prev, packageSize: size }))}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        newItem.packageSize === size
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{size}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Additional notes <span className="text-muted-foreground">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Order number, account number, or any info we need to process your return
                </p>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Order #12345, Customer ID: ABC123"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons - only show on detail steps */}
          {modalStep !== "select-type" && (
            <div className="pt-4 flex gap-3 mt-4 border-t border-border">
              <button
                onClick={() => setModalStep("select-type")}
                className="flex items-center justify-center gap-2 flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={addItem}
                disabled={
                  !newItem.description.trim() ||
                  (modalStep !== "amazon-qr-details" && !newItem.returnTo) ||
                  (modalStep !== "amazon-qr-details" &&
                    newItem.returnTo === "Other" &&
                    !newItem.returnToOther.trim()) ||
                  !newItem.packageSize ||
                  (newItem.labelType === "email-pdf" && !newItem.file) ||
                  (newItem.labelType === "amazon-qr" && (!newItem.file || !newItem.retailer)) ||
                  (newItem.labelType === "no-label" &&
                    newItem.needHelpGettingLabel &&
                    !newItem.file &&
                    !newItem.returnPortalLink)
                }
                className="flex-1 rounded-full bg-foreground py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {editingItemId ? "Update Item" : "Add item"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {DEBUG_UPLOAD && debugFileInfo && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border-2 border-orange-500 bg-orange-50 p-3 shadow-lg">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-bold text-orange-900 text-sm">Upload Debug Info</div>
            <button
              onClick={() => setDebugFileInfo("")}
              className="text-orange-700 hover:text-orange-900"
              aria-label="Clear debug info"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-orange-900 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
            {debugFileInfo}
          </div>
        </div>
      )}
    </main>
  )
}

export default SchedulePage
