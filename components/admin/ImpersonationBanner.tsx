import { cookies } from "next/headers"
import { UserCog } from "lucide-react"
import { getImpersonatedCustomer } from "@/server/services/impersonation"
import { StopImpersonatingButton } from "./StopImpersonatingButton"

export const ImpersonationBanner = async () => {
  const cookieStore = await cookies()
  const customerId = cookieStore.get("impersonating_user_id")?.value

  if (!customerId) return null

  const customer = await getImpersonatedCustomer(customerId)
  const label = customer?.fullName ?? customer?.email ?? customerId

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-700/40 bg-amber-400 px-4 py-2 text-sm text-amber-950 shadow-sm">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4" />
        <span>
          Viewing as <strong>{label}</strong>
        </span>
      </div>
      <StopImpersonatingButton />
    </div>
  )
}
