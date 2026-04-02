"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Package, ArrowLeft, LogOut, Clock, MapPin, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useOrders } from "@/app/(customer)/orders/OrdersContext"
import { parseDateET } from "@/lib/timezone"

export const CustomerOrders = () => {
  const { orders, profile, userEmail, statusColors, statusLabels, statusDescriptions, handleSignOut } = useOrders()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[rgba(249,249,246,0.88)] backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_0_rgba(26,26,46,0.06)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">My Orders</h1>
              <p className="text-sm text-muted-foreground">{profile?.fullName || userEmail}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-medium">No orders yet</h2>
              <p className="mb-6 text-center text-muted-foreground">
                Schedule your first pickup and we&apos;ll handle the rest.
              </p>
              <Button asChild>
                <Link href="/schedule">Schedule a Pickup</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className={statusColors[order.trackingStatus || "pending"]}>
                            {statusLabels[order.trackingStatus || "pending"]}
                          </Badge>
                          {order.isInstant && (
                            <Badge variant="secondary" className="text-xs">
                              Instant
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {statusDescriptions[order.trackingStatus || "pending"]}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {format(parseDateET(order.pickupDate.split("T")[0]), "MMM d")} at {order.pickupTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{order.address?.city}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            <span>{order.items?.length || 0} item(s)</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Schedule New Pickup CTA */}
        {orders.length > 0 && (
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/schedule">Schedule Another Pickup</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
