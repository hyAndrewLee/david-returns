"use client"

import { Plus, X } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { ItemModal } from "@/app/(customer)/schedule/steps/ItemModal"

export const ItemsStep = () => {
  const { formData, editItem, removeItem, handleOpenAddItemModal } = useSchedule()

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">Items</span>
        <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
          What are you returning?
        </h1>
        <p className="mt-3 text-muted-foreground">Add each item you'd like us to pick up.</p>
      </div>

      {formData.items.length > 0 && (
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => editItem(item)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); editItem(item) } }}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.labelType === "has-label" && "Has printed label"}
                    {item.labelType === "email-pdf" && "Email/PDF label"}
                    {item.labelType === "amazon-qr" && "Amazon QR code"}
                    {item.labelType === "no-label" && "Need us to get label"}
                    {item.retailer && ` • ${item.retailer}`}
                    {item.needsBox === false && " (No box needed)"}
                    {item.returnTo && ` • Drop off: ${item.returnTo}`}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(item.id) }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleOpenAddItemModal}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
      >
        <Plus className="h-5 w-5" />
        <span>Add item</span>
      </button>

      <ItemModal />
    </div>
  )
}
