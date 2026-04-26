"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
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
import { Search, MapPin, Trash2, UserCog } from "lucide-react"
import { format } from "date-fns"
import { useAdminDashboard } from "@/app/(admin)/manage/dashboard/AdminDashboardContext"

export const AdminCustomersTab = () => {
  const {
    filteredCustomers,
    customerSearchTerm,
    setCustomerSearchTerm,
    deletingCustomerId,
    handleDeleteCustomer,
    impersonatingCustomerId,
    handleImpersonate,
  } = useAdminDashboard()

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={customerSearchTerm}
            onChange={(e) => setCustomerSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const defaultAddress = customer.addresses?.find((a) => a.is_default) || customer.addresses?.[0]
                  const subscription = customer.subscriptions?.[0]
                  const isMember = subscription?.status === "active"

                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.fullName || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{customer.email || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{customer.phone || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        {defaultAddress ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
                            <div>
                              <div className="text-sm">{defaultAddress.street_address}</div>
                              <div className="text-xs text-muted-foreground">
                                {defaultAddress.city}, {defaultAddress.zip}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No address</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isMember ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20">Member</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.createdAt ? format(new Date(customer.createdAt), "MMM d, yyyy") : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mr-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleImpersonate(customer.id)}
                          disabled={impersonatingCustomerId === customer.id}
                          title="View site as this customer"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={deletingCustomerId === customer.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{customer.fullName || customer.email}</strong>? This will permanently remove
                                their account, all orders, addresses, and subscription data. This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {deletingCustomerId === customer.id ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
