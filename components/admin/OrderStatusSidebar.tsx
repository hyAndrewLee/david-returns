"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { Badge } from "@/components/ui/Badge"
import { Save } from "lucide-react"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"
import { ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS, type OrderStatus } from "@/lib/constants"

export const OrderStatusSidebar = () => {
  const {
    order,
    adminNotes,
    isSaving,
    isUpdatingStatus,
    setAdminNotes,
    handleSave,
    handleUpdateStatus,
  } = useAdminOrderDetail()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <Badge variant="outline" className={STATUS_COLORS[order.status]}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <Select
            value={order.status}
            onValueChange={(value) => handleUpdateStatus(value as OrderStatus)}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Internal Notes</Label>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${((order.totalAmount || 0) / 100).toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">
            {order.isInstant ? "Instant delivery" : "Standard pickup"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
