"use client"

import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"

export const OrderDetailHeader = () => {
  const { order, trackingStatus, statusColors, statusLabels } = useAdminOrderDetail()

  return (
    <header className="border-b bg-card">
      <div className="flex max-w-5xl items-center gap-4 px-4 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/manage/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">
            Created{" "}
            {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a") : "N/A"}
          </p>
        </div>
        <Badge variant="outline" className={statusColors[trackingStatus]}>
          {statusLabels[trackingStatus]}
        </Badge>
      </div>
    </header>
  )
}
