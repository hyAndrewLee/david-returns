"use client"

import { format } from "date-fns"
import { MapPin, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"
import { parseDateET } from "@/lib/timezone"

export const OrderPickupCard = () => {
  const { order } = useOrderDetail()

  return (
    <>
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
          {order.pickupDate && order.pickupTime ? (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(parseDateET(order.pickupDate.split("T")[0]), "EEEE, MMMM d")} at {order.pickupTime}
              </span>
              {order.isInstant && (
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
    </>
  )
}
