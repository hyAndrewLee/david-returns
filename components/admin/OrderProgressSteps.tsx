"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { CheckCircle } from "lucide-react"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"

export const OrderProgressSteps = () => {
  const { currentStepIndex, statusLabels, statusSteps } = useAdminOrderDetail()

  return (
    <Card className="mb-8">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    index <= currentStepIndex
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="mt-2 text-xs text-muted-foreground">{statusLabels[step]}</span>
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={`mx-2 h-1 flex-1 rounded ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
