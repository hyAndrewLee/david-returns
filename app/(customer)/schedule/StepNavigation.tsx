"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const StepNavigation = () => {
  const { currentStep, handleNextStep, handlePreviousStep, canProceed, returnToStep } = useSchedule()

  if (currentStep >= 6) return null

  return (
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
  )
}
