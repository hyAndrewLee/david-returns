"use client"

import { format } from "date-fns"
import { CheckCircle, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"

export const OrderTimeline = () => {
  const { order } = useOrderDetail()

  if (!order.pickedUpAt && !order.deliveredAt && !order.returnConfirmedAt) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.returnConfirmedAt && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium">Return Confirmed</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.returnConfirmedAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          )}
          {order.deliveredAt && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Delivered to Carrier</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.deliveredAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          )}
          {order.pickedUpAt && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Package Picked Up</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.pickedUpAt), "MMMM d, yyyy 'at' h:mm a")}
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
                {order.createdAt
                  ? format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
