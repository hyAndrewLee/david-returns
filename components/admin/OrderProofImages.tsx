"use client"

import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Label } from "@/components/ui/Label"
import { Camera, Upload, ExternalLink } from "lucide-react"
import { useAdminOrderDetail } from "@/app/(admin)/manage/orders/[id]/AdminOrderDetailContext"

const PROOF_TYPES = [
  { type: "pickup" as const, label: "Pickup Proof", urlKey: "proofPickupUrl" as const },
  { type: "delivery" as const, label: "Delivery Proof", urlKey: "proofDeliveryUrl" as const },
  { type: "return" as const, label: "Return Confirmation", urlKey: "proofReturnUrl" as const },
] as const

export const OrderProofImages = () => {
  const { order, uploadingType, handleUploadProof } = useAdminOrderDetail()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Camera className="h-4 w-4" />
          Proof Images
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {PROOF_TYPES.map(({ type, label, urlKey }) => {
            const url = order[urlKey]

            return (
              <div key={type} className="space-y-2">
                <Label>{label}</Label>
                {url ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={label}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-2 rounded bg-black/50 p-1"
                    >
                      <ExternalLink className="h-4 w-4 text-white" />
                    </a>
                  </div>
                ) : (
                  <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploadingType === type ? "Uploading..." : "Upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadProof(type, file)
                      }}
                      disabled={uploadingType !== null}
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
