"use client"

import { ScheduleProvider, useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { ErrorBanner } from "@/app/(customer)/schedule/ErrorBanner"
import { ScheduleHeader } from "@/app/(customer)/schedule/ScheduleHeader"
import { StepIndicator } from "@/app/(customer)/schedule/StepIndicator"
import { StepNavigation } from "@/app/(customer)/schedule/StepNavigation"
import { DebugPanel } from "@/app/(customer)/schedule/DebugPanel"
import { ScheduleStep } from "@/app/(customer)/schedule/steps/ScheduleStep"
import { AddressStep } from "@/app/(customer)/schedule/steps/AddressStep"
import { PickupMethodStep } from "@/app/(customer)/schedule/steps/PickupMethodStep"
import { PlanStep } from "@/app/(customer)/schedule/steps/PlanStep"
import { ItemsStep } from "@/app/(customer)/schedule/steps/ItemsStep"
import { CheckoutStep } from "@/app/(customer)/schedule/steps/CheckoutStep"

const STEP_COMPONENTS: Record<number, React.ReactNode> = {
  1: <ScheduleStep />,
  2: <AddressStep />,
  3: <PickupMethodStep />,
  4: <PlanStep />,
  5: <ItemsStep />,
  6: <CheckoutStep />,
}

const SchedulePageContent = () => {
  const { currentStep } = useSchedule()

  return (
    <main className="min-h-screen bg-linear-to-b from-surface-container-low to-surface">
      <ScheduleHeader />
      <StepIndicator />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorBanner />

        {STEP_COMPONENTS[currentStep]}
        <StepNavigation />
      </div>

      <DebugPanel />
    </main>
  )
}

const SchedulePage = () => (
  <ScheduleProvider>
    <SchedulePageContent />
  </ScheduleProvider>
)

export default SchedulePage
