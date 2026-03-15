"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"

export const OrderPayment = () => {
  const { order } = useOrderDetail()

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="text-xl font-bold">${((order.totalAmount || 0) / 100).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Need help with this order?</p>
        <p>
          Contact us at{" "}
          <a href="mailto:hello@davidreturns.com" className="text-primary underline">
            hello@davidreturns.com
          </a>
        </p>
      </div>
    </>
  )
}
