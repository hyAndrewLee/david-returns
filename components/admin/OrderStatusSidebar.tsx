"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Textarea } from "@/components/ui/Textarea"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Save } from "lucide-react"
import { format } from "date-fns"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"

export const OrderStatusSidebar = () => {
  const {
    order,
    trackingStatus,
    adminNotes,
    trackingNumber,
    isSaving,
    setTrackingStatus,
    setAdminNotes,
    setTrackingNumber,
    handleSave,
  } = useAdminOrderDetail()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tracking Status</Label>
            <Select value={trackingStatus} onValueChange={setTrackingStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress (Picked Up)</SelectItem>
                <SelectItem value="completed">Completed (Returned)</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tracking Number (Optional)</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Notes</Label>
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

      {(order.pickedUpAt || order.deliveredAt || order.returnConfirmedAt) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.pickedUpAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Picked up</span>
                <span>{format(new Date(order.pickedUpAt), "MMM d, h:mm a")}</span>
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivered</span>
                <span>{format(new Date(order.deliveredAt), "MMM d, h:mm a")}</span>
              </div>
            )}
            {order.returnConfirmedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return confirmed</span>
                <span>{format(new Date(order.returnConfirmedAt), "MMM d, h:mm a")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
