"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, ExternalLink, Camera, FileText, Download } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Label } from "@/components/ui/Label"
import { useOrderDetail } from "@/app/orders/[id]/OrderDetailContext"
import { parseDateET } from "@/lib/timezone"

export const CustomerOrderDetail = () => {
  const { order, statusColors, statusLabels, statusSteps, currentStepIndex } = useOrderDetail()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), "MMMM d, yyyy")}</p>
          </div>
          <Badge variant="outline" className={statusColors[order.tracking_status || "pending"]}>
            {statusLabels[order.tracking_status || "pending"]}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Progress Steps */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10 ${
                        index <= currentStepIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <span className="text-xs font-medium sm:text-sm">{index + 1}</span>
                      )}
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground">{statusLabels[step].split(" ")[0]}</span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`mx-1 h-1 flex-1 rounded sm:mx-2 ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracking Number */}
        {order.tracking_number && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-mono font-medium">{order.tracking_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pickup Details */}
        <Card className="mb-6">
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
            {order.pickup_date && order.pickup_time ? (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(parseDateET(order.pickup_date.split("T")[0]), "EEEE, MMMM d")} at {order.pickup_time}
                </span>
                {order.is_instant && (
                  <Badge variant="secondary" className="ml-2">
                    Instant
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Pickup date to be scheduled</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Items ({order.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.retailer}</p>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={item.hasLabel ? "default" : "secondary"} className="text-xs">
                        {item.hasLabel ? "Label" : "No Label"}
                      </Badge>
                      <Badge variant={item.hasBox ? "default" : "secondary"} className="text-xs">
                        {item.hasBox ? "Boxed" : "Unboxed"}
                      </Badge>
                    </div>
                  </div>
                  {item.notes && (
                    <div className="mt-2 rounded-md bg-blue-50 dark:bg-blue-950 px-3 py-2">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-0.5">Notes:</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{item.notes}</p>
                    </div>
                  )}
                  {item.returnTo && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        Drop off at:{" "}
                        {item.returnTo === "Other" && item.returnToOther ? item.returnToOther : item.returnTo}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Label Images */}
        {order.items && order.items.some((item) => item.labelFileUrl || item.photoUrl) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Your Uploaded Labels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index}>
                    {(item.labelFileUrl || item.photoUrl) && (
                      <div className="rounded-lg border p-4">
                        <div className="mb-3">
                          <p className="font-medium">{item.retailer}</p>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          {item.labelType && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.labelType === "has-label"
                                ? "Physical Label"
                                : item.labelType === "email-pdf"
                                  ? "Digital Label"
                                  : item.labelType === "amazon-qr"
                                    ? "QR Code"
                                    : "No Label"}
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {item.labelFileUrl && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Label/QR Code</Label>
                              <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                                <img
                                  src={item.labelFileUrl || "/placeholder.svg"}
                                  alt="Return label or QR code"
                                  className="h-full w-full object-contain"
                                />
                                <a
                                  href={item.labelFileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute right-2 top-2 rounded bg-black/70 p-2 transition-colors hover:bg-black"
                                >
                                  <Download className="h-4 w-4 text-white" />
                                </a>
                              </div>
                            </div>
                          )}
                          {item.photoUrl && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Item Photo</Label>
                              <div className="relative aspect-video overflow-hidden rounded-lg border">
                                <img
                                  src={item.photoUrl || "/placeholder.svg"}
                                  alt="Item photo"
                                  className="h-full w-full object-cover"
                                />
                                <a
                                  href={item.photoUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute right-2 top-2 rounded bg-black/70 p-2 transition-colors hover:bg-black"
                                >
                                  <Download className="h-4 w-4 text-white" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proof Photos */}
        {(order.proof_pickup_url || order.proof_delivery_url || order.proof_return_url) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-4 w-4" />
                Proof Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {order.proof_pickup_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pickup</p>
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
                    {order.picked_up_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.picked_up_at), "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                )}
                {order.proof_delivery_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Delivery</p>
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
                    {order.delivered_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.delivered_at), "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                )}
                {order.proof_return_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Return Confirmed</p>
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
                    {order.return_confirmed_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.return_confirmed_at), "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {(order.picked_up_at || order.delivered_at || order.return_confirmed_at) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.return_confirmed_at && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">Return Confirmed</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.return_confirmed_at), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Delivered to Carrier</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.delivered_at), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
                {order.picked_up_at && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Package Picked Up</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.picked_up_at), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="text-xl font-bold">${((order.total_amount || 0) / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help with this order?</p>
          <p>
            Contact us at{" "}
            <a href="mailto:hello@davidreturns.com" className="text-primary underline">
              hello@davidreturns.com
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
