"use client"

import Image from "next/image"
import { FileText, Download } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Label } from "@/components/ui/Label"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"
import type { OrderItem } from "@/server/db/schema/orders"

export const OrderLabels = () => {
  const { order } = useOrderDetail()

  if (!order.items || !order.items.some((item) => item.labelFileUrl || item.photoUrl)) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Your Uploaded Labels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.items.map((item: OrderItem) => (
            <div key={`${item.retailer}-${item.description}`}>
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
                          <Image
                            src={item.labelFileUrl || "/placeholder.svg"}
                            alt="Return label or QR code"
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-contain"
                            unoptimized
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
                          <Image
                            src={item.photoUrl || "/placeholder.svg"}
                            alt="Item photo"
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-cover"
                            unoptimized
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
  )
}
