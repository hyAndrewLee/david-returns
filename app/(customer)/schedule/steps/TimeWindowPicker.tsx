"use client"

import { Clock } from "lucide-react"
import { useSchedule, TIME_WINDOWS, isTimeWindowPassed } from "@/app/(customer)/schedule/ScheduleContext"
import { getTodayET } from "@/lib/timezone"

export const TimeWindowPicker = () => {
  const { formData, setFormData } = useSchedule()

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-4">Select a time window</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TIME_WINDOWS.map((time) => {
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
  )
}
