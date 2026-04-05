"use client"

import { Home, Building, Check, Plus } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const SavedAddressList = () => {
  const { savedAddresses, selectedAddressId, handleSelectAddress, handleShowNewAddressForm } = useSchedule()

  return (
    <div className="grid gap-3">
      {savedAddresses.map((addr) => (
        <button
          key={addr.id}
          type="button"
          onClick={() => handleSelectAddress(addr)}
          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedAddressId === addr.id
              ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
              : "border-border bg-card hover:border-foreground/30"
          }`}
        >
          <div
            className={`mt-0.5 rounded-full p-2 ${
              selectedAddressId === addr.id ? "bg-orange-500 text-white" : "bg-muted"
            }`}
          >
            {addr.label.toLowerCase().includes("work") ? (
              <Building className="h-4 w-4" />
            ) : (
              <Home className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{addr.label}</span>
              {addr.is_default && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Default</span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {addr.street_address}
              {addr.apt ? `, ${addr.apt}` : ""}, {addr.city} {addr.zip}
            </p>
            <p className="text-sm text-muted-foreground">
              {addr.full_name} • {addr.phone}
            </p>
          </div>
          {selectedAddressId === addr.id && <Check className="h-5 w-5 text-orange-500" />}
        </button>
      ))}

      <button
        type="button"
        onClick={handleShowNewAddressForm}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
      >
        <Plus className="h-4 w-4" />
        <span>Use a different address</span>
      </button>
    </div>
  )
}
