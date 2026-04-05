"use client"

import { Home, Building, Check, Plus } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const AddressStep = () => {
  const {
    savedAddresses,
    selectedAddressId,
    showAddressForm,
    formData,
    setFormData,
    handleSelectAddress,
    handleShowNewAddressForm,
    prefilledFromSignup,
    userId,
    saveThisAddress,
    setSaveThisAddress,
  } = useSchedule()

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">Address</span>
        <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">Where should we pick&nbsp;up?</h1>
        <p className="mt-3 text-muted-foreground">
          {savedAddresses.length > 0 && !showAddressForm
            ? "Select your pickup address or add a new one."
            : prefilledFromSignup
              ? "We filled in the address from when you signed up. Update it here if anything changed."
              : "Enter your pickup address and contact info."}
        </p>
      </div>

      {savedAddresses.length > 0 && !showAddressForm && (
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
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Default
                    </span>
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
      )}

      {(showAddressForm || savedAddresses.length === 0) && (
        <div className="space-y-5">
          {prefilledFromSignup && savedAddresses.length === 0 && (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Using your signup address from your account. You can edit any field below.
            </div>
          )}
          {savedAddresses.length > 0 && (
            <h3 className="font-medium">New Address</h3>
          )}

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
      )}
    </div>
  )
}
