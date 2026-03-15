"use client"

import { OrderDetailHeader } from "@/components/customer/OrderDetailHeader"
import { OrderProgress } from "@/components/customer/OrderProgress"
import { OrderPickupCard } from "@/components/customer/OrderPickupCard"
import { OrderItemsList } from "@/components/customer/OrderItemsList"
import { OrderLabels } from "@/components/customer/OrderLabels"
import { OrderProofPhotos } from "@/components/customer/OrderProofPhotos"
import { OrderTimeline } from "@/components/customer/OrderTimeline"
import { OrderPayment } from "@/components/customer/OrderPayment"

export const CustomerOrderDetail = () => {
  return (
    <div className="min-h-screen bg-background">
      <OrderDetailHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <OrderProgress />
        <OrderPickupCard />
        <OrderItemsList />
        <OrderLabels />
        <OrderProofPhotos />
        <OrderTimeline />
        <OrderPayment />
      </main>
    </div>
  )
}
