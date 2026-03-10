"use client"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { Package, ArrowLeft, LogOut, Clock, MapPin, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { parseDateET } from "@/lib/timezone"

type Order = {
  id: string
  created_at: string
  pickup_date: string
  pickup_time: string
  address: {
    street: string
    apt?: string
    city: string
    zip: string
  }
  items: Array<{
    retailer: string
    description?: string
  }>
  is_instant: boolean
  tracking_status: string
  total_amount: number
  proof_pickup_url?: string
  proof_delivery_url?: string
  proof_return_url?: string
}

type Profile = {
  full_name: string
  email: string
  phone: string
} | null

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pending Pickup",
  in_progress: "Picked Up", // Changed from "In Progress" to "Picked Up"
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusDescriptions: Record<string, string> = {
  pending: "Your package is scheduled for pickup",
  in_progress: "We've picked up your package and are processing your return", // Updated description to match new label
  completed: "Your return has been completed",
  cancelled: "This order was cancelled",
}

export function CustomerOrders({
  orders: initialOrders,
  profile,
  userEmail,
}: { orders: Order[]; profile: Profile; userEmail: string }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("orders-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">My Orders</h1>
              <p className="text-sm text-muted-foreground">{profile?.full_name || userEmail}</p>
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
                          <Badge variant="outline" className={statusColors[order.tracking_status || "pending"]}>
                            {statusLabels[order.tracking_status || "pending"]}
                          </Badge>
                          {order.is_instant && (
                            <Badge variant="secondary" className="text-xs">
                              Instant
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {statusDescriptions[order.tracking_status || "pending"]}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {format(parseDateET(order.pickup_date.split("T")[0]), "MMM d")} at {order.pickup_time}
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
