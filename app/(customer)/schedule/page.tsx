"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Check, Zap, X } from "lucide-react"
import { ScheduleProvider, useSchedule, STEPS } from "@/app/(customer)/schedule/ScheduleContext"
import { ScheduleStep } from "@/app/(customer)/schedule/steps/ScheduleStep"
import { AddressStep } from "@/app/(customer)/schedule/steps/AddressStep"
import { PickupMethodStep } from "@/app/(customer)/schedule/steps/PickupMethodStep"
import { PlanStep } from "@/app/(customer)/schedule/steps/PlanStep"
import { ItemsStep } from "@/app/(customer)/schedule/steps/ItemsStep"
import { CheckoutStep } from "@/app/(customer)/schedule/steps/CheckoutStep"

const SchedulePageContent = () => {
  const {
    currentStep,
    setCurrentStep,
    handleNextStep,
    handlePreviousStep,
    canProceed,
    formData,
    isSuccess,
    error,
    returnToStep,
    DEBUG_UPLOAD,
    debugFileInfo,
    setDebugFileInfo,
  } = useSchedule()

  if (isSuccess) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </div>
          <h1 className="font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">You're all set!</h1>
          <p className="mt-3 text-lg text-muted-foreground">We'll confirm your pickup by text shortly.</p>
          <div className="mt-8 rounded-[0.375rem] bg-surface-container-lowest p-6 text-left shadow-[0_4px_24px_rgba(26,28,27,0.06)]">
            <h3 className="font-medium text-foreground">Pickup details</h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">Date:</span>{" "}
                {(() => {
                  const [year, month, day] = formData.selectedDate.split("-").map(Number)
                  const localDate = new Date(year, month - 1, day)
                  return localDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
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
            className="mt-8 inline-flex items-center gap-2 rounded-[0.375rem] bg-primary px-7 py-3.5 text-sm font-medium text-on-primary transition-all hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)]"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-surface-container-low to-surface">
      <header className="bg-[rgba(249,249,246,0.88)] backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_0_rgba(26,26,46,0.06)]">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link href="/">
              <Image src="/images/david-returns-logo.png" alt="David Returns" width={140} height={40} className="h-8 w-auto" />
            </Link>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="bg-surface-container-lowest shadow-[0_1px_0_rgba(26,26,46,0.05)]">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
                    step.id === currentStep
                      ? "text-foreground"
                      : step.id < currentStep
                        ? "text-accent-warm cursor-pointer hover:opacity-80"
                        : "text-muted-foreground/50 cursor-not-allowed"
                  } ${step.id <= currentStep ? "cursor-pointer" : ""}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                      step.id === currentStep
                        ? "bg-foreground text-background shadow-md"
                        : step.id < currentStep
                          ? "bg-accent-warm text-white hover:opacity-90"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-8 sm:w-12 transition-colors duration-200 ${
                      step.id < currentStep ? "bg-accent-warm" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {error && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-100 max-w-md w-full mx-4">
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 shadow-lg">
              {error}
            </div>
          </div>
        )}

        {currentStep === 1 && <ScheduleStep />}
        {currentStep === 2 && <AddressStep />}
        {currentStep === 3 && <PickupMethodStep />}
        {currentStep === 4 && <PlanStep />}
        {currentStep === 5 && <ItemsStep />}
        {currentStep === 6 && <CheckoutStep />}

        {currentStep < 6 && (
          <div className="mt-10 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handlePreviousStep}
                className="flex items-center gap-2 rounded-[0.375rem] border border-[rgba(26,26,46,0.15)] bg-surface-container-lowest px-6 py-3 text-sm font-medium text-foreground hover:bg-surface-container-low transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                {returnToStep ? "Cancel" : "Back"}
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-[0.375rem] bg-primary px-7 py-3 text-sm font-medium text-on-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {returnToStep ? "Save & return" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {DEBUG_UPLOAD && debugFileInfo && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border-2 border-orange-500 bg-orange-50 p-3 shadow-lg">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-bold text-orange-900 text-sm">Upload Debug Info</div>
            <button onClick={() => setDebugFileInfo("")} className="text-orange-700 hover:text-orange-900" aria-label="Clear debug info">
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

const SchedulePage = () => (
  <ScheduleProvider>
    <SchedulePageContent />
  </ScheduleProvider>
)

export default SchedulePage
