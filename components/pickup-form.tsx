"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { PickupFormData, PlanType, ReturnType, TimeWindow } from "@/lib/types"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface PickupFormProps {
  selectedPlan: PlanType | null
}

const initialFormData: PickupFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  retailer: "",
  itemsDescription: "",
  returnType: "Pre-labeled package ready",
  preferredDate: "",
  timeWindow: "8–11am",
  notes: "",
  plan: "Pay-As-You-Go",
  numPackages: 1,
  serviceType: "Standard",
}

export function PickupForm({ selectedPlan }: PickupFormProps) {
  const [formData, setFormData] = useState<PickupFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (selectedPlan) {
      setFormData((prev) => ({ ...prev, plan: selectedPlan }))
    }
  }, [selectedPlan])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Required"
    if (!formData.email.trim()) {
      newErrors.email = "Required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email"
    }
    if (!formData.phone.trim()) newErrors.phone = "Required"
    if (!formData.address.trim()) newErrors.address = "Required"
    if (!formData.city.trim()) newErrors.city = "Required"
    if (!formData.zip.trim()) newErrors.zip = "Required"
    if (!formData.retailer.trim()) newErrors.retailer = "Required"
    if (!formData.itemsDescription.trim()) newErrors.itemsDescription = "Required"
    if (!formData.preferredDate) newErrors.preferredDate = "Required"

    if (formData.plan === "Pay-As-You-Go") {
      if (!formData.numPackages || formData.numPackages < 1) {
        newErrors.numPackages = "At least 1"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setSubmitError("")

    try {
      const response = await fetch("/api/pickups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit request")
      }

      setSubmitStatus("success")
      setFormData(initialFormData)
      setErrors({})
    } catch (err) {
      setSubmitStatus("error")
      setSubmitError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numPackages" ? Number.parseInt(value) || 0 : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  if (submitStatus === "success") {
    return (
      <section id="schedule-pickup" className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">Request received</h3>
            <p className="mt-2 text-sm text-muted-foreground">We'll confirm your pickup by text or email.</p>
            <button
              onClick={() => setSubmitStatus("idle")}
              className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Schedule another
            </button>
          </div>
        </div>
      </section>
    )
  }

  const timeWindows: TimeWindow[] = ["8–11am", "11am–2pm", "2–5pm", "5–8pm"]
  const returnTypes: ReturnType[] = ["Pre-labeled package ready", "Need us to bring label", "Handle everything"]

  const inputClasses = (fieldName: string) =>
    `mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors ${
      errors[fieldName] ? "border-destructive" : "border-input"
    }`

  const labelClasses = "block text-sm font-medium text-foreground"

  return (
    <section id="schedule-pickup" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Schedule your pickup</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Available in NYC during our pilot. We'll confirm after you submit.
          </p>
        </div>

        {submitStatus === "error" && (
          <div className="mt-8 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {/* Plan Selection */}
          <div>
            <label className={labelClasses}>Plan</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["Pay-As-You-Go", "Membership"] as PlanType[]).map((plan) => (
                <label
                  key={plan}
                  className={`flex cursor-pointer items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                    formData.plan === plan
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={formData.plan === plan}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {plan}
                </label>
              ))}
            </div>

            {formData.plan === "Pay-As-You-Go" && (
              <div className="mt-3">
                <label className={labelClasses}>Number of packages</label>
                <input
                  type="number"
                  name="numPackages"
                  min="1"
                  value={formData.numPackages || ""}
                  onChange={handleChange}
                  className={inputClasses("numPackages")}
                />
                {errors.numPackages && <p className="mt-1 text-xs text-destructive">{errors.numPackages}</p>}
              </div>
            )}

            {formData.plan === "Membership" && (
              <p className="mt-2 text-xs text-muted-foreground">Unlimited pickups & packages included.</p>
            )}
          </div>

          {/* Service Type */}
          <div>
            <label className={labelClasses}>Service type</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                { value: "Standard", label: "Standard" },
                { value: "Instant", label: "Instant (+$1.50)" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                    formData.serviceType === opt.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={opt.value}
                    checked={formData.serviceType === opt.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClasses}>Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClasses("name")}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClasses}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClasses("email")}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClasses}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClasses("phone")}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClasses}>Pickup address</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className={inputClasses("address")}
              placeholder="123 Main St, Apt 4B"
            />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClasses}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={inputClasses("city")}
                placeholder="New York"
              />
              {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
            </div>
            <div>
              <label className={labelClasses}>ZIP</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className={inputClasses("zip")}
                placeholder="10001"
              />
              {errors.zip && <p className="mt-1 text-xs text-destructive">{errors.zip}</p>}
            </div>
          </div>

          {/* Return Details */}
          <div>
            <label className={labelClasses}>Retailer</label>
            <input
              type="text"
              name="retailer"
              placeholder="Amazon, Zara, Nike..."
              value={formData.retailer}
              onChange={handleChange}
              className={inputClasses("retailer")}
            />
            {errors.retailer && <p className="mt-1 text-xs text-destructive">{errors.retailer}</p>}
          </div>

          <div>
            <label className={labelClasses}>Items</label>
            <textarea
              name="itemsDescription"
              rows={2}
              placeholder="2 shirts, 1 pair of shoes..."
              value={formData.itemsDescription}
              onChange={handleChange}
              className={inputClasses("itemsDescription")}
            />
            {errors.itemsDescription && <p className="mt-1 text-xs text-destructive">{errors.itemsDescription}</p>}
          </div>

          <div>
            <label className={labelClasses}>Return type</label>
            <select
              name="returnType"
              value={formData.returnType}
              onChange={handleChange}
              className={inputClasses("returnType")}
            >
              {returnTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClasses}>Preferred date</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={inputClasses("preferredDate")}
              />
              {errors.preferredDate && <p className="mt-1 text-xs text-destructive">{errors.preferredDate}</p>}
            </div>
            <div>
              <label className={labelClasses}>Time window</label>
              <select
                name="timeWindow"
                value={formData.timeWindow}
                onChange={handleChange}
                className={inputClasses("timeWindow")}
              >
                {timeWindows.map((window) => (
                  <option key={window} value={window}>
                    {window}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClasses}>Notes for driver (optional)</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Gate code, building instructions..."
              value={formData.notes}
              onChange={handleChange}
              className={inputClasses("notes")}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit request"
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
