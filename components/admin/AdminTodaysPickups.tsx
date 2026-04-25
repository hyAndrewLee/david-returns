"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Clock, Eye, MapPin, Calendar } from "lucide-react"
import { useAdminDashboard, statusColors, statusLabels } from "@/app/(admin)/manage/dashboard/AdminDashboardContext"
import type { Order } from "@/app/(admin)/manage/dashboard/AdminDashboardContext"
import { getOrderCustomer } from "@/lib/orderCustomer"

const TIME_WINDOWS = ["8-11am", "11am-2pm", "2-5pm", "5-8pm"] as const

const PickupRow = ({ order }: { order: Order }) => {
  const customer = getOrderCustomer(order)
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">#{order.id.slice(0, 8)}</div>
        {order.isInstant && (
          <Badge
            variant="outline"
            className="mt-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium"
          >
            Instant
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="font-medium">{customer.fullName || "N/A"}</div>
        <div className="text-xs text-muted-foreground">{customer.phone || ""}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-1">
          <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{order.address?.street}</div>
            {order.address?.apt && <div className="text-xs text-muted-foreground">Apt {order.address.apt}</div>}
            <div className="text-xs text-muted-foreground">
              {order.address?.city}, {order.address?.zip}
            </div>
            {order.address?.pickupInstructions && (
              <div className="text-xs text-muted-foreground">Instructions: {order.address.pickupInstructions}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{order.items?.length || 0} item(s)</div>
        <div className="text-xs text-muted-foreground">
          {order.items?.[0]?.retailer}
          {order.items?.length > 1 && ` +${order.items.length - 1}`}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={statusColors[order.status]}>
          {statusLabels[order.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/manage/orders/${order.id}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              View
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

const TimeWindowSection = ({ timeWindow, pickups }: { timeWindow: string; pickups: Order[] }) => {
  if (pickups.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">{timeWindow}</h3>
        <Badge variant="secondary" className="ml-auto">
          {pickups.length} pickup{pickups.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickups.map((order) => (
                <PickupRow key={order.id} order={order} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

const UnassignedPickupsSection = ({ pickups }: { pickups: Order[] }) => {
  if (pickups.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Other Times</h3>
        <Badge variant="secondary" className="ml-auto">
          {pickups.length} pickup{pickups.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickups.map((order) => {
                const customer = getOrderCustomer(order)
                return (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">#{order.id.slice(0, 8)}</div>
                    {order.isInstant && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium"
                      >
                        Instant
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.fullName || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{customer.phone || ""}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{order.pickupTime || "Not set"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1">
                      <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{order.address?.street}</div>
                        {order.address?.apt && (
                          <div className="text-xs text-muted-foreground">Apt {order.address.apt}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {order.address?.city}, {order.address?.zip}
                        </div>
                        {order.address?.pickupInstructions && (
                          <div className="text-xs text-muted-foreground">
                            Instructions: {order.address.pickupInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{order.items?.length || 0} item(s)</div>
                    <div className="text-xs text-muted-foreground">
                      {order.items?.[0]?.retailer}
                      {order.items?.length > 1 && ` +${order.items.length - 1}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/manage/orders/${order.id}`}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export const AdminTodaysPickups = () => {
  const { todaysPickups } = useAdminDashboard()

  if (todaysPickups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pickups scheduled for today</h3>
          <p className="text-sm text-muted-foreground">Check back tomorrow or view all orders</p>
        </CardContent>
      </Card>
    )
  }

  const unassignedPickups = todaysPickups.filter(
    (order) => !TIME_WINDOWS.includes(order.pickupTime as (typeof TIME_WINDOWS)[number]),
  )

  return (
    <div className="space-y-6">
      {TIME_WINDOWS.map((timeWindow) => {
        const pickupsInWindow = todaysPickups.filter((order) => order.pickupTime === timeWindow)
        return <TimeWindowSection key={timeWindow} timeWindow={timeWindow} pickups={pickupsInWindow} />
      })}
      <UnassignedPickupsSection pickups={unassignedPickups} />
    </div>
  )
}
