"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Checkbox } from "@/components/ui/Checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog"
import { Search, Eye, Truck, Trash2, Check } from "lucide-react"
import { useAdminDashboard, statusColors, statusLabels } from "@/app/manage/dashboard/AdminDashboardContext"
import { formatDateShort } from "@/lib/timezone"

export const AdminOrdersTab = () => {
  const {
    filteredOrders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedOrderIds,
    deletingOrderId,
    updatingOrderId,
    isBulkDeleting,
    handleDeleteOrder,
    handleBulkDelete,
    handleQuickStatusUpdate,
    toggleOrderSelection,
    toggleAllOrders,
  } = useAdminDashboard()

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search by order ID, tracking, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="return_confirmed">Return Confirmed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedOrderIds.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {selectedOrderIds.size} {selectedOrderIds.size === 1 ? "Order" : "Orders"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedOrderIds.size} Orders?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedOrderIds.size}
                  {selectedOrderIds.size === 1 ? " order" : " orders"}? This action cannot be undone and will permanently
                  remove all order data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600">
                  {isBulkDeleting ? "Deleting..." : "Delete Orders"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={toggleAllOrders}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrderIds.has(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.profiles?.full_name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.profiles?.phone || order.profiles?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.pickup_date ? formatDateShort(order.pickup_date.split("T")[0]) : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">{order.pickup_time}</div>
                      {order.is_instant && (
                        <Badge
                          variant="outline"
                          className="mt-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium"
                        >
                          Instant
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[order.tracking_status || "pending"]}>
                        {statusLabels[order.tracking_status || "pending"]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.tracking_status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuickStatusUpdate(order.id, "in_progress")}
                            disabled={updatingOrderId === order.id}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Truck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {order.tracking_status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuickStatusUpdate(order.id, "picked_up")}
                            disabled={updatingOrderId === order.id}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/manage/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={deletingOrderId === order.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete order #{order.id.slice(0, 8)}? This action cannot be
                                undone and will permanently remove all order data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {deletingOrderId === order.id ? "Deleting..." : "Delete Order"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
