"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Package, MapPin, FileText, Camera } from "lucide-react"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"
import type { OrderItem } from "@/server/db/schema/orders"

export const OrderItems = () => {
  const { order } = useAdminOrderDetail()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Items ({order.items?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.items?.map((item: OrderItem) => (
            <div key={`${item.retailer}-${item.description}`} className="rounded-lg border bg-muted/30 p-4">
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
  )
}
