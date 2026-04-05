"use client"

import { X } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const DebugPanel = () => {
  const { DEBUG_UPLOAD, debugFileInfo, setDebugFileInfo } = useSchedule()

  if (!DEBUG_UPLOAD || !debugFileInfo) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border-2 border-orange-500 bg-orange-50 p-3 shadow-lg">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-bold text-orange-900 text-sm">Upload Debug Info</div>
        <button
          onClick={() => setDebugFileInfo("")}
          className="text-orange-700 hover:text-orange-900"
          aria-label="Clear debug info"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="text-xs text-orange-900 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
        {debugFileInfo}
      </div>
    </div>
  )
}
