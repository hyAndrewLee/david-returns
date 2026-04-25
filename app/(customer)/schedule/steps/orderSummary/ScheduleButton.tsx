"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const ScheduleButton = () => {
  const {
    calculateTotal,
    discountApplied,
    uploadFilesAndProceedToPayment,
    isUploadingFiles,
    selectedAddressId,
    showAddressForm,
    setError,
    isMember,
  } = useSchedule()

  const total = calculateTotal()

  const handleProceed = () => {
    if (!selectedAddressId && !showAddressForm) {
      setError("Please select an address or fill in the form.")
      return
    }
    uploadFilesAndProceedToPayment()
  }

  const label = isUploadingFiles
    ? "Uploading files..."
    : total.total === 0 && discountApplied
      ? "Confirm pickup"
      : isMember
        ? "Schedule pickup"
        : "Proceed to payment"

  return (
    <>
      <button
        onClick={handleProceed}
        disabled={isUploadingFiles}
        className="mt-6 w-full rounded-[0.375rem] bg-primary py-4 text-sm font-medium text-on-primary transition-all hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)] disabled:opacity-50"
      >
        {label}
      </button>
      <p className="mt-4 text-center text-xs text-muted-foreground">By confirming, you agree to our Terms of Service</p>
    </>
  )
}
