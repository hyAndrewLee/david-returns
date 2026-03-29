"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import {
  Package,
  Plus,
  LogOut,
  Clock,
  MapPin,
  ChevronRight,
  History,
  Truck,
  CheckCircle2,
  Crown,
  User,
  Mail,
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ContactSupportDialog } from "@/components/customer/ContactSupportDialog"
import { formatDateShort } from "@/lib/timezone"
import { useDashboard } from "@/app/(customer)/dashboard/DashboardContext"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pending Pickup",
  in_progress: "Picked Up",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const UserDashboard = () => {
  const {
    activeOrders,
    pastOrders,
    showPastOrders,
    setShowPastOrders,
    showContactDialog,
    setShowContactDialog,
    handleSignOut,
    isMember,
    isFirstTime,
    firstName,
    displayName,
    profile,
    userEmail,
  } = useDashboard()

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/images/david-returns-logo.png"
                alt="David Returns"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowContactDialog(true)} title="Contact Us">
                <Mail className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild title="Profile Settings">
                <Link href="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ContactSupportDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        userEmail={userEmail}
        userName={profile?.fullName || ""}
      />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">Dashboard</span>
          <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            {isFirstTime ? `Welcome, ${firstName}` : `Welcome back, ${firstName}`}
          </h1>
          <p className="mt-3 text-muted-foreground">Manage your returns and schedule new pickups.</p>
        </div>

        {isMember && (
          <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Unlimited Member</h3>
                    <Badge className="bg-orange-500 text-white text-xs">Active</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-orange-600">$0 per pickup</p>
                <p className="text-xs text-muted-foreground">Unlimited returns</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Return CTA */}
        <div className="mb-8 relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full bg-accent-warm-light/40 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-[150px] w-[150px] rounded-full bg-accent-green-light/30 blur-3xl" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 transition-colors group-hover:bg-accent-warm-light">
                <Package className="h-7 w-7 text-accent-warm" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Need to return something?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isMember
                    ? "Your pickup is free with your unlimited membership."
                    : "We'll pick it up and handle everything for you."}
                </p>
              </div>
            </div>
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Submit Return
              {isMember && <Badge className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0">FREE</Badge>}
            </Link>
          </div>
        </div>

        {/* Active Returns Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-accent-warm" />
            <h2 className="text-lg font-semibold text-foreground">Active Returns</h2>
            {activeOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeOrders.length}
              </Badge>
            )}
          </div>

          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-10">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 font-medium text-foreground">No active returns</h3>
                <p className="text-sm text-muted-foreground text-center">
                  When you submit a return, it will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-foreground/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className={statusColors[order.trackingStatus || "pending"]}>
                              {statusLabels[order.trackingStatus || "pending"]}
                            </Badge>
                            {order.isInstant && (
                              <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Instant</Badge>
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {formatDateShort(order.pickupDate)} at {order.pickupTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{order.address?.city || "New York"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Package className="h-3.5 w-3.5" />
                              <span>{order.items?.length || 1} item(s)</span>
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
        </div>

        {/* Past Returns Section */}
        <div>
          <button
            onClick={() => setShowPastOrders(!showPastOrders)}
            className="mb-4 flex w-full items-center justify-between rounded-lg p-2 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Past Returns</h2>
              {pastOrders.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {pastOrders.length}
                </Badge>
              )}
            </div>
            <ChevronRight
              className={`h-5 w-5 text-muted-foreground transition-transform ${showPastOrders ? "rotate-90" : ""}`}
            />
          </button>

          {showPastOrders && (
            <>
              {pastOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-8">
                    <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No completed returns yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                      <Card className="transition-all hover:shadow-md opacity-75 hover:opacity-100">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <Badge variant="outline" className={statusColors[order.trackingStatus || "pending"]}>
                                  {statusLabels[order.trackingStatus || "pending"]}
                                </Badge>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>
                                    {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Package className="h-3.5 w-3.5" />
                                  <span>{order.items?.length || 1} item(s)</span>
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}
