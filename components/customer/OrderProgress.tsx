"use client"

import { CheckCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/Card"
import { useOrderDetail } from "@/app/(customer)/orders/[id]/OrderDetailContext"

export const OrderProgress = () => {
  const { statusSteps, statusLabels, currentStepIndex } = useOrderDetail()

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <div className="flex items-start justify-between">
          {statusSteps.map((step, index) => (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10 ${
                    index <= currentStepIndex
                      ? "border-primary bg-primary text-on-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <span className="text-xs font-medium sm:text-sm">{index + 1}</span>
                  )}
                </div>
                <span className="mt-2 text-xs text-muted-foreground">{statusLabels[step].split(" ")[0]}</span>
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={`mx-1 mt-[14px] h-1 flex-1 rounded sm:mx-2 sm:mt-[18px] ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
