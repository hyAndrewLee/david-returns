"use client"

import { DatePicker } from "@/app/(customer)/schedule/steps/DatePicker"
import { TimeWindowPicker } from "@/app/(customer)/schedule/steps/TimeWindowPicker"

export const ScheduleStep = () => {
  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">Schedule</span>
        <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">When should we pick&nbsp;up?</h1>
        <p className="mt-3 text-muted-foreground">Choose a date and time that works for you.</p>
      </div>

      <DatePicker />
      <TimeWindowPicker />
    </div>
  )
}
