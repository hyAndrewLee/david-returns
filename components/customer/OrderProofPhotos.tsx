"use client"

import Image from "next/image"
import { format } from "date-fns"
import { Camera, ExternalLink } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"

export const OrderProofPhotos = () => {
  const { order } = useOrderDetail()

  if (!order.proofPickupUrl && !order.proofDeliveryUrl && !order.proofReturnUrl) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Camera className="h-4 w-4" />
          Proof Photos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {order.proofPickupUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Pickup</p>
              <div className="relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={order.proofPickupUrl || "/placeholder.svg"}
                  alt="Pickup proof"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
                <a
                  href={order.proofPickupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-2 rounded bg-black/50 p-1"
                >
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              </div>
              {order.pickedUpAt && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.pickedUpAt), "MMM d, h:mm a")}
                </p>
              )}
            </div>
          )}
          {order.proofDeliveryUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Delivery</p>
              <div className="relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={order.proofDeliveryUrl || "/placeholder.svg"}
                  alt="Delivery proof"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
                <a
                  href={order.proofDeliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-2 rounded bg-black/50 p-1"
                >
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              </div>
              {order.deliveredAt && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.deliveredAt), "MMM d, h:mm a")}
                </p>
              )}
            </div>
          )}
          {order.proofReturnUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Return Confirmed</p>
              <div className="relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={order.proofReturnUrl || "/placeholder.svg"}
                  alt="Return proof"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
                <a
                  href={order.proofReturnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-2 rounded bg-black/50 p-1"
                >
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              </div>
              {order.returnConfirmedAt && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.returnConfirmedAt), "MMM d, h:mm a")}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
