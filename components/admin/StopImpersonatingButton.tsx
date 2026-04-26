"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { trpc } from "@/lib/trpc"

export const StopImpersonatingButton = () => {
  const [isStopping, setIsStopping] = useState(false)
  const stopMutation = trpc.admin.stopImpersonation.useMutation()

  const handleStop = async () => {
    setIsStopping(true)
    try {
      const { redirectUrl } = await stopMutation.mutateAsync()
      window.location.href = redirectUrl
    } catch (error) {
      setIsStopping(false)
      const message = error instanceof Error ? error.message : "Unknown error"
      alert(`Failed to stop impersonation: ${message}`)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleStop}
      disabled={isStopping}
      className="border-amber-900/40 bg-white/80 text-amber-950 hover:bg-white"
    >
      {isStopping ? "Stopping..." : "Stop Impersonating"}
    </Button>
  )
}
