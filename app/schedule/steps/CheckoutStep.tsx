"use client"

import { Edit2, Zap, Sparkles, Crown, Check } from "lucide-react"
import { useSchedule } from "@/app/schedule/ScheduleContext"
import StripeCheckout from "@/components/StripeCheckout"

export const CheckoutStep = () => {
  const {
    formData,
    setFormData,
    setCurrentStep,
    isMember,
    calculateTotal,
    showPayment,
    setShowPayment,
    uploadFilesAndProceedToPayment,
    isUploadingFiles,
    uploadedItems,
    addressConfirmed,
    showAddressForm,
    setError,
  } = useSchedule()

  const total = calculateTotal()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Confirm your pickup</h1>
        <p className="mt-2 text-muted-foreground">Review your details before confirming.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Pickup details</h3>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground font-medium">
                  {(() => {
                    const [year, month, day] = formData.selectedDate.split("-").map(Number)
                    const localDate = new Date(year, month - 1, day)
                    return localDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  })()}
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

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Address</h3>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
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
              <p className="text-muted-foreground">
                {formData.city}, NY {formData.zip}
              </p>
              <p className="text-muted-foreground mt-1">{formData.phone}</p>
              {formData.buildingName && (
                <p className="text-muted-foreground">Building: {formData.buildingName}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Items ({formData.items.length})</h3>
              <button
                onClick={() => setCurrentStep(5)}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
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
        </div>

        <div>
          <div className="rounded-2xl border border-border bg-card p-6 sticky top-32">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order summary</h2>

            {isMember && (
              <div className="mb-6 rounded-xl bg-linear-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 shrink-0">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Thank you for being a loyal member!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This pickup is completely free with your unlimited membership.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm">
              {isMember ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unlimited membership</span>
                    <span className="text-emerald-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This pickup</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>
                  {formData.isInstant && (
                    <div className="flex justify-between">
                      <span className="text-orange-600 flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> Instant pickup
                      </span>
                      <span className="text-emerald-600 font-medium">FREE</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-semibold text-emerald-600">$0.00</span>
                    </div>
                  </div>
                </>
              ) : total.isMembership ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unlimited membership</span>
                    <span className="text-foreground font-medium">$14.99/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This pickup</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-semibold text-foreground">${total.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup fee</span>
                    <span className="text-foreground font-medium">${total.pickup.toFixed(2)}</span>
                  </div>
                  {total.items > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Additional items ({formData.items.length - 1})
                      </span>
                      <span className="text-foreground font-medium">${total.items.toFixed(2)}</span>
                    </div>
                  )}
                  {!isMember && formData.isInstant && (
                    <div className="flex justify-between">
                      <span className="text-orange-600 flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> Instant pickup
                      </span>
                      <span className="text-orange-600 font-medium">${total.instant.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-semibold text-foreground">${total.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {formData.plan === "Pay-As-You-Go" && !total.isExistingMember && (
              <div className="mt-6 rounded-xl bg-orange-50 border border-orange-100 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Save with Unlimited</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Get unlimited pickups for just $14.99/mo
                    </p>
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, plan: "Membership" }))}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700 mt-2"
                    >
                      Upgrade now →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showPayment ? (
              <>
                <button
                  onClick={() => {
                    if (!addressConfirmed && !showAddressForm) {
                      setError("Please select an address or fill in the form.")
                      return
                    }
                    uploadFilesAndProceedToPayment()
                  }}
                  disabled={isUploadingFiles}
                  className="mt-6 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isUploadingFiles ? "Uploading files..." : "Proceed to payment"}
                </button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By confirming, you agree to our Terms of Service
                </p>
              </>
            ) : (
              <div className="mt-6">
                <StripeCheckout
                  plan={formData.plan}
                  itemCount={formData.items.length}
                  isInstant={formData.isInstant}
                  pickupDate={formData.selectedDate}
                  pickupTime={formData.timeWindow}
                  pickupMethod={formData.pickupMethod}
                  address={{
                    fullName: formData.name,
                    phone: formData.phone,
                    street: formData.address,
                    apt: formData.apt,
                    city: formData.city,
                    zip: formData.zip,
                    notes: formData.notes,
                    pickupInstructions: formData.pickupInstructions,
                  }}
                  items={uploadedItems}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
