"use client"

import { Package, MapPin } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"
import type { OrderItem } from "@/server/db/schema/orders"

export const OrderItemsList = () => {
  const { order } = useOrderDetail()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Items ({order.items?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {order.items?.map((item: OrderItem) => (
            <div key={`${item.retailer}-${item.description}`} className="rounded-lg border p-3">
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
  )
}
