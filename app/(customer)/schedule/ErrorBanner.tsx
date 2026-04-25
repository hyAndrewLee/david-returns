import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"

export const ErrorBanner = () => {
  const { error } = useSchedule()

  if (!error) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-100 max-w-md w-full mx-4">
      <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 shadow-lg">
        {error}
      </div>
    </div>
  )
}

