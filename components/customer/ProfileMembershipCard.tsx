"use client"

import Link from "next/link"
import { Crown, AlertTriangle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useProfile } from "@/app/(customer)/profile/ProfileContext"

export const ProfileMembershipCard = () => {
  const {
    canceling,
    showCancelConfirm,
    setShowCancelConfirm,
    handleCancelMembership,
    isMember,
    isCanceling,
    subscription,
  } = useProfile()

  if (isMember) {
    return (
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-500" />
            Unlimited Membership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isCanceling ? "Cancels" : "Renews"} on{" "}
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">$22.99</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
          </div>

          {isCanceling ? (
            <div className="rounded-lg bg-amber-100 border border-amber-200 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Membership Canceling</p>
                  <p className="text-xs text-amber-700 mt-1">
                    You'll keep your benefits until{" "}
                    {subscription?.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-orange-100 border border-orange-200 p-3">
                <p className="text-sm text-orange-900">
                  <strong>Unlimited pickups</strong> - All returns are free with your membership
                </p>
              </div>

              {!showCancelConfirm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancel Membership
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Are you sure? You'll lose unlimited free pickups.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1"
                      disabled={canceling}
                    >
                      Keep Membership
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelMembership}
                      className="flex-1"
                      disabled={canceling}
                    >
                      {canceling ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        "Confirm Cancel"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="h-5 w-5 text-orange-500" />
          Membership
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground mb-2">You don't have an active membership</p>
          <p className="text-3xl font-bold text-orange-600 mb-1">$22.99</p>
          <p className="text-xs text-muted-foreground mb-4">per month</p>
        </div>

        <div className="rounded-lg bg-orange-100 border border-orange-200 p-3 space-y-2">
          <p className="text-sm font-medium text-orange-900">Get unlimited returns</p>
          <ul className="text-xs text-orange-800 space-y-1 ml-4 list-disc">
            <li>Free pickups for all returns</li>
            <li>Cancel anytime</li>
            <li>Priority support</li>
          </ul>
        </div>

        <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/schedule">Get Membership</Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Start your first return to activate membership
        </p>
      </CardContent>
    </Card>
  )
}
