"use client"

import { OrderDetailHeader } from "@/components/admin/OrderDetailHeader"
import { OrderProgressSteps } from "@/components/admin/OrderProgressSteps"
import { OrderCustomerInfo } from "@/components/admin/OrderCustomerInfo"
import { OrderPickupDetails } from "@/components/admin/OrderPickupDetails"
import { OrderItems } from "@/components/admin/OrderItems"
import { OrderProofImages } from "@/components/admin/OrderProofImages"
import { OrderStatusSidebar } from "@/components/admin/OrderStatusSidebar"

export const OrderDetail = () => {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <OrderDetailHeader />

      <main className="space-y-8">
        <OrderProgressSteps />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <OrderCustomerInfo />
            <OrderPickupDetails />
            <OrderItems />
            <OrderProofImages />
          </div>

          <OrderStatusSidebar />
        </div>
      </main>
    </div>
  )
}
