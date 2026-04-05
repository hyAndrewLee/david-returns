"use client"

import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const AddressForm = () => {
  const {
    savedAddresses,
    selectedAddressId,
    formData,
    setFormData,
    prefilledFromSignup,
    userId,
    saveThisAddress,
    setSaveThisAddress,
  } = useSchedule()

  return (
    <div className="space-y-5">
      {prefilledFromSignup && savedAddresses.length === 0 && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Using your signup address from your account. You can edit any field below.
        </div>
      )}
      {savedAddresses.length > 0 && <h3 className="font-medium">New Address</h3>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="address-name" className="text-sm font-medium text-foreground">Full name</label>
          <input
            id="address-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>
        <div>
          <label htmlFor="address-phone" className="text-sm font-medium text-foreground">Mobile number</label>
          <input
            id="address-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address-street" className="text-sm font-medium text-foreground">Street address</label>
        <input
          id="address-street"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          placeholder="123 Main Street"
          className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="address-apt" className="text-sm font-medium text-foreground">
            Apt / Unit <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="address-apt"
            type="text"
            value={formData.apt}
            onChange={(e) => setFormData((prev) => ({ ...prev, apt: e.target.value }))}
            placeholder="4B"
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>
        <div>
          <label htmlFor="address-city" className="text-sm font-medium text-foreground">City</label>
          <input
            id="address-city"
            type="text"
            value={formData.city}
            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="New York"
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>
        <div>
          <label htmlFor="address-zip" className="text-sm font-medium text-foreground">ZIP code</label>
          <input
            id="address-zip"
            type="text"
            value={formData.zip}
            onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value }))}
            placeholder="10001"
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address-building" className="text-sm font-medium text-foreground">
          Building name <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="address-building"
          type="text"
          value={formData.buildingName}
          onChange={(e) => setFormData((prev) => ({ ...prev, buildingName: e.target.value }))}
          placeholder="e.g. The Avalon, Empire State Building"
          className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
        />
      </div>

      <div>
        <label htmlFor="address-notes" className="text-sm font-medium text-foreground">
          Building access notes <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="address-notes"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Gate code, doorman instructions, etc."
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
        />
      </div>

      {userId && !selectedAddressId && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="saveAddress"
            checked={saveThisAddress}
            onChange={(e) => setSaveThisAddress(e.target.checked)}
            className="h-4 w-4 rounded border-border text-orange-500 focus:ring-orange-500"
          />
          <label htmlFor="saveAddress" className="text-sm text-muted-foreground">
            Save this address for future pickups
          </label>
        </div>
      )}
    </div>
  )
}
