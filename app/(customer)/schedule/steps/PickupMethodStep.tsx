"use client"

import { Hand, DoorOpen, Camera } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const PickupMethodStep = () => {
  const { formData, setFormData } = useSchedule()

  return (
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
  )
}
