"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { MapPin, Package, Calendar } from "lucide-react"
import { format } from "date-fns"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"
import { parseDateET } from "@/lib/timezone"

export const OrderPickupDetails = () => {
  const { order } = useAdminOrderDetail()

  return (
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
              {order.pickupDate
                ? `${format(parseDateET(order.pickupDate.split("T")[0]), "MMM d, yyyy")} at ${order.pickupTime}`
                : "Not scheduled"}
            </span>
          </div>
          {order.isInstant && <Badge variant="secondary">Instant Delivery</Badge>}
        </div>
        {order.pickupMethod && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Pickup Method:{" "}
              <span className="font-normal">
                {order.pickupMethod === "hand-to-me"
                  ? "Hand to us"
                  : order.pickupMethod === "leave-at-door"
                    ? "Leave at door"
                    : order.pickupMethod === "leave-with-doorman"
                      ? "Leave with doorman"
                      : order.pickupMethod}
              </span>
            </span>
          </div>
        )}
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
  )
}
