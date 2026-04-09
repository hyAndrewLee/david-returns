"use client"

import { useState } from "react"
import { Zap, Sparkles, Crown, Tag, X } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import StripeCheckout from "@/components/customer/StripeCheckout"

export const OrderSummary = () => {
  const {
    formData,
    setFormData,
    isMember,
    discountCode,
    setDiscountCode,
    discountApplied,
    applyDiscountCode,
    removeDiscountCode,
    calculateTotal,
    showPayment,
    uploadFilesAndProceedToPayment,
    isUploadingFiles,
    uploadedItems,
    selectedAddressId,
    showAddressForm,
    setError,
  } = useSchedule()

  const [showDiscountInput, setShowDiscountInput] = useState(false)
  const total = calculateTotal()

  return (
    <div className="rounded-[0.375rem] bg-surface-container-lowest p-6 sticky top-32">
      <h2 className="text-lg font-semibold text-foreground mb-4">Order summary</h2>

      {isMember && (
        <div className="mb-6 rounded-[0.375rem] bg-copper-light p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-copper/20 shrink-0">
              <Crown className="h-5 w-5 text-copper" />
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
              <span className="text-foreground font-medium">$22.99/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This pickup</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>
            {total.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-emerald-600 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Discount
                </span>
                <span className="text-emerald-600 font-medium">-${total.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className={`font-semibold ${total.total === 0 ? "text-emerald-600" : "text-foreground"}`}>
                  {total.total === 0 ? "FREE" : `$${total.total.toFixed(2)}`}
                </span>
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
                <span className="text-muted-foreground">Additional items ({formData.items.length - 1})</span>
                <span className="text-foreground font-medium">${total.items.toFixed(2)}</span>
              </div>
            )}
            {formData.isInstant && (
              <div className="flex justify-between">
                <span className="text-orange-600 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Instant pickup
                </span>
                <span className="text-orange-600 font-medium">${total.instant.toFixed(2)}</span>
              </div>
            )}
            {total.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-emerald-600 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Discount
                </span>
                <span className="text-emerald-600 font-medium">-${total.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className={`font-semibold ${total.total === 0 ? "text-emerald-600" : "text-foreground"}`}>
                  {total.total === 0 ? "FREE" : `$${total.total.toFixed(2)}`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {formData.plan === "Pay-As-You-Go" && !total.isExistingMember && (
        <div className="mt-6 rounded-[0.375rem] bg-copper-light p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-copper mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Save with Unlimited</p>
              <p className="text-xs text-muted-foreground mt-0.5">Get unlimited pickups for just $22.99/mo</p>
              <button
                onClick={() => setFormData((prev) => ({ ...prev, plan: "Membership" }))}
                className="text-xs font-medium text-copper hover:text-foreground mt-2 transition-colors"
              >
                Upgrade now →
              </button>
            </div>
          </div>
        </div>
      )}

      {!isMember && !showPayment && (
        <div className="mt-4">
          {discountApplied ? (
            <div className="flex items-center justify-between rounded-[0.375rem] bg-emerald-50 border border-emerald-200 px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">{discountCode.toUpperCase()}</span>
              </div>
              <button
                onClick={removeDiscountCode}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : showDiscountInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyDiscountCode()}
                placeholder="Enter code"
                className="flex-1 rounded-[0.375rem] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={applyDiscountCode}
                className="rounded-[0.375rem] bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDiscountInput(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Have a discount code?
            </button>
          )}
        </div>
      )}

      {!showPayment ? (
        <>
          <button
            onClick={() => {
              if (!selectedAddressId && !showAddressForm) {
                setError("Please select an address or fill in the form.")
                return
              }
              uploadFilesAndProceedToPayment()
            }}
            disabled={isUploadingFiles}
            className="mt-6 w-full rounded-[0.375rem] bg-primary py-4 text-sm font-medium text-on-primary transition-all hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)] disabled:opacity-50"
          >
            {isUploadingFiles
              ? "Uploading files..."
              : total.total === 0 && discountApplied
                ? "Confirm pickup"
                : "Proceed to payment"}
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
            discountCode={discountApplied ? discountCode.trim().toUpperCase() : undefined}
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
  )
}
