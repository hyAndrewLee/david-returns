"use client"

import { Zap } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const DatePicker = () => {
  const { dates, formData, handleDateSelect } = useSchedule()

  return (
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
  )
}
