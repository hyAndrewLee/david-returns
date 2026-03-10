"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Upload,
  CheckCircle,
  Camera,
  Save,
  ExternalLink,
  FileText,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { updateOrderStatus, uploadProofImage } from "@/app/manage/actions"
import { createClient } from "@/lib/supabase/client"
import { parseDateET } from "@/lib/timezone"

type Order = {
  id: string
  created_at: string
  pickup_date: string
  pickup_time: string
  pickup_method?: string
  address: {
    fullName: string
    phone: string
    street: string
    apt?: string
    city: string
    zip: string
    notes?: string
    pickupInstructions?: string
  }
  items: Array<{
    retailer: string
    description?: string
    hasLabel: boolean
    hasBox: boolean
    labelFileUrl?: string
    photoUrl?: string
    labelType?: string
    packageSize?: string
    notes?: string
    returnTo?: string
    returnToOther?: string
  }>
  is_instant: boolean
  status: string
  tracking_status: string
  total_amount: number
  profiles?: {
    full_name: string
    email: string
    phone: string
  }
  proof_pickup_url?: string
  proof_delivery_url?: string
  proof_return_url?: string
  picked_up_at?: string
  delivered_at?: string
  return_confirmed_at?: string
  admin_notes?: string
  tracking_number?: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusSteps = ["pending", "in_progress", "completed"]

export const OrderDetail = ({ order: initialOrder }: { order: Order }) => {
  const [order, setOrder] = useState(initialOrder)
  const [trackingStatus, setTrackingStatus] = useState(order.tracking_status || "pending")
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || "")
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "")
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const router = useRouter()

  const currentStepIndex = statusSteps.indexOf(trackingStatus)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`admin-order-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder(payload.new as Order)
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id, router])

  console.log("[v0] Order items:", order.items)
  console.log(
    "[v0] Items with files:",
    order.items?.filter((item) => item.labelFileUrl || item.photoUrl),
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateOrderStatus(order.id, {
        tracking_status: trackingStatus,
        admin_notes: adminNotes,
        tracking_number: trackingNumber,
      })
      router.refresh()
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadProof = async (type: "pickup" | "delivery" | "return", file: File) => {
    try {
      setUploadingType(type)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("orderId", order.id)
      formData.append("type", type)

      await uploadProofImage(formData)

      router.refresh()
    } catch (error) {
      console.error("Failed to upload proof:", error)
    } finally {
      setUploadingType(null)
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex max-w-5xl items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/manage/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Badge variant="outline" className={statusColors[trackingStatus]}>
            {statusLabels[trackingStatus]}
          </Badge>
        </div>
      </header>

      <main className="space-y-8">
        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        index <= currentStepIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground">{statusLabels[step]}</span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`mx-2 h-1 flex-1 rounded ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.address?.fullName || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.profiles?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.address?.phone || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Pickup Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{order.address?.street}</p>
                  {order.address?.apt && <p className="text-muted-foreground">Apt: {order.address.apt}</p>}
                  <p className="text-muted-foreground">
                    {order.address?.city}, NY {order.address?.zip}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {order.pickup_date
                        ? `${format(parseDateET(order.pickup_date.split("T")[0]), "MMM d, yyyy")} at ${order.pickup_time}`
                        : "Not scheduled"}
                    </span>
                  </div>
                  {order.is_instant && <Badge variant="secondary">Instant Delivery</Badge>}
                </div>
                {/* Pickup Method */}
                {order.pickup_method && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Pickup Method:{" "}
                      <span className="font-normal">
                        {order.pickup_method === "hand-to-me"
                          ? "Hand to us"
                          : order.pickup_method === "leave-at-door"
                            ? "Leave at door"
                            : order.pickup_method === "leave-with-doorman"
                              ? "Leave with doorman"
                              : order.pickup_method}
                      </span>
                    </span>
                  </div>
                )}
                {/* Pickup Instructions */}
                {order.address?.pickupInstructions && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-sm font-medium text-blue-900">Pickup Instructions:</p>
                    <p className="text-sm text-blue-700">{order.address.pickupInstructions}</p>
                  </div>
                )}
                {order.address?.notes && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Pickup Notes:</p>
                    <p className="text-sm text-muted-foreground">{order.address.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Items ({order.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold">{item.retailer}</p>
                          {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={item.hasLabel ? "default" : "secondary"}>
                            {item.hasLabel ? "Has Label" : "No Label"}
                          </Badge>
                          <Badge variant={item.hasBox ? "default" : "secondary"}>
                            {item.hasBox ? "Has Box" : "No Box"}
                          </Badge>
                        </div>
                      </div>

                      {/* Drop-off Location */}
                      {(item.returnTo || item.returnToOther) && (
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">
                            Drop off at:{" "}
                            <span className="font-normal">
                              {item.returnTo === "other" ? item.returnToOther : item.returnTo}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Customer Notes per Item */}
                      {item.notes && (
                        <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
                          <p className="text-sm font-medium text-blue-900">Notes:</p>
                          <p className="text-sm text-blue-700">{item.notes}</p>
                        </div>
                      )}

                      {(item.labelFileUrl || item.photoUrl) && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          {item.labelFileUrl && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <a
                                href={item.labelFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                View Return Label/QR Code
                              </a>
                            </div>
                          )}
                          {item.photoUrl && (
                            <div className="flex items-center gap-2 text-sm">
                              <Camera className="h-4 w-4 text-green-600" />
                              <a
                                href={item.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline font-medium"
                              >
                                View Item Photo
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Proof Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="h-4 w-4" />
                  Proof Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Pickup Proof */}
                  <div className="space-y-2">
                    <Label>Pickup Proof</Label>
                    {order.proof_pickup_url ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg border">
                        <img
                          src={order.proof_pickup_url || "/placeholder.svg"}
                          alt="Pickup proof"
                          className="h-full w-full object-cover"
                        />
                        <a
                          href={order.proof_pickup_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-2 rounded bg-black/50 p-1"
                        >
                          <ExternalLink className="h-4 w-4 text-white" />
                        </a>
                      </div>
                    ) : (
                      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {uploadingType === "pickup" ? "Uploading..." : "Upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadProof("pickup", file)
                          }}
                          disabled={uploadingType !== null}
                        />
                      </label>
                    )}
                  </div>

                  {/* Delivery Proof */}
                  <div className="space-y-2">
                    <Label>Delivery Proof</Label>
                    {order.proof_delivery_url ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg border">
                        <img
                          src={order.proof_delivery_url || "/placeholder.svg"}
                          alt="Delivery proof"
                          className="h-full w-full object-cover"
                        />
                        <a
                          href={order.proof_delivery_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-2 rounded bg-black/50 p-1"
                        >
                          <ExternalLink className="h-4 w-4 text-white" />
                        </a>
                      </div>
                    ) : (
                      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {uploadingType === "delivery" ? "Uploading..." : "Upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadProof("delivery", file)
                          }}
                          disabled={uploadingType !== null}
                        />
                      </label>
                    )}
                  </div>

                  {/* Return Proof */}
                  <div className="space-y-2">
                    <Label>Return Confirmation</Label>
                    {order.proof_return_url ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg border">
                        <img
                          src={order.proof_return_url || "/placeholder.svg"}
                          alt="Return proof"
                          className="h-full w-full object-cover"
                        />
                        <a
                          href={order.proof_return_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-2 rounded bg-black/50 p-1"
                        >
                          <ExternalLink className="h-4 w-4 text-white" />
                        </a>
                      </div>
                    ) : (
                      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {uploadingType === "return" ? "Uploading..." : "Upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadProof("return", file)
                          }}
                          disabled={uploadingType !== null}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Status & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tracking Status</Label>
                  <Select value={trackingStatus} onValueChange={setTrackingStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress (Picked Up)</SelectItem>
                      <SelectItem value="completed">Completed (Returned)</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tracking Number (Optional)</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${((order.total_amount || 0) / 100).toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  {order.is_instant ? "Instant delivery" : "Standard pickup"}
                </p>
              </CardContent>
            </Card>

            {/* Timestamps */}
            {(order.picked_up_at || order.delivered_at || order.return_confirmed_at) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {order.picked_up_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Picked up</span>
                      <span>{format(new Date(order.picked_up_at), "MMM d, h:mm a")}</span>
                    </div>
                  )}
                  {order.delivered_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered</span>
                      <span>{format(new Date(order.delivered_at), "MMM d, h:mm a")}</span>
                    </div>
                  )}
                  {order.return_confirmed_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return confirmed</span>
                      <span>{format(new Date(order.return_confirmed_at), "MMM d, h:mm a")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
