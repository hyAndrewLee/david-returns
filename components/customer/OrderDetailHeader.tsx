"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"

export const OrderDetailHeader = () => {
  const { order, statusColors, statusLabels } = useOrderDetail()

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">
            {order.createdAt ? format(new Date(order.createdAt), "MMMM d, yyyy") : "N/A"}
          </p>
        </div>
        <Badge variant="outline" className={statusColors[order.trackingStatus || "pending"]}>
          {statusLabels[order.trackingStatus || "pending"]}
        </Badge>
      </div>
    </header>
  )
}
