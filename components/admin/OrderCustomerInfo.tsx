"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { User, Mail, Phone } from "lucide-react"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"

export const OrderCustomerInfo = () => {
  const { order } = useAdminOrderDetail()

  return (
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
  )
}
