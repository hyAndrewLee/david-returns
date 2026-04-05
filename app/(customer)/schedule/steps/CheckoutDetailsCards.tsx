"use client"

import { Edit2, Zap } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const CheckoutDetailsCards = () => {
  const { formData, editFromCheckout } = useSchedule()

  const formattedDate = (() => {
    const [year, month, day] = formData.selectedDate.split("-").map(Number)
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  })()

  return (
    <div className="space-y-4">
      <div className="rounded-[0.375rem] bg-surface-container-lowest p-5 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Pickup details</h3>
          <button
            onClick={() => editFromCheckout(1)}
            className="text-sm text-accent-warm hover:opacity-80 flex items-center gap-1 transition-opacity"
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-foreground font-medium">
              {formattedDate}
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

      <div className="rounded-[0.375rem] bg-surface-container-lowest p-5 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Address</h3>
          <button
            onClick={() => editFromCheckout(2)}
            className="text-sm text-accent-warm hover:opacity-80 flex items-center gap-1 transition-opacity"
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
          <p className="text-muted-foreground">{formData.city}, NY {formData.zip}</p>
          <p className="text-muted-foreground mt-1">{formData.phone}</p>
          {formData.buildingName && (
            <p className="text-muted-foreground">Building: {formData.buildingName}</p>
          )}
        </div>
      </div>

      <div className="rounded-[0.375rem] bg-surface-container-lowest p-5 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Items ({formData.items.length})</h3>
          <button
            onClick={() => editFromCheckout(5)}
            className="text-sm text-accent-warm hover:opacity-80 flex items-center gap-1 transition-opacity"
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
              {item.returnTo && ` (Drop off: ${item.returnTo})`}
            </div>
          ))}
        </div>
      </div>

      {formData.isInstant && (
        <p className="flex items-center gap-1.5 text-sm text-orange-600">
          <Zap className="h-4 w-4" /> Instant same-day pickup — $1.50 fee applies
        </p>
      )}
    </div>
  )
}
