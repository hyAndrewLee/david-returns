"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { Save } from "lucide-react"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"

export const OrderStatusSidebar = () => {
  const {
    order,
    adminNotes,
    isSaving,
    setAdminNotes,
    handleSave,
  } = useAdminOrderDetail()

  return (
    <div className="space-y-6">
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
