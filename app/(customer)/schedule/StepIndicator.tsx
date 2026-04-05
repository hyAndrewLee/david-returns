"use client"

import { Check } from "lucide-react"
import { useSchedule, getScheduleSteps } from "@/app/(customer)/schedule/ScheduleContext"

export const StepIndicator = () => {
  const { currentStep, setCurrentStep, isMember, membershipChecked } = useSchedule()
  const scheduleSteps = getScheduleSteps(membershipChecked, isMember)

  return (
    <div className="bg-surface-container-lowest shadow-[0_1px_0_rgba(26,26,46,0.05)]">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between">
          {scheduleSteps.map((step, index) => (
            <div key={step.id} className="flex items-start">
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
              {index < scheduleSteps.length - 1 && (
                <div
                  className={`mx-2 mt-[19px] h-0.5 w-8 sm:w-12 transition-colors duration-200 ${
                    step.id < currentStep ? "bg-accent-warm" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
