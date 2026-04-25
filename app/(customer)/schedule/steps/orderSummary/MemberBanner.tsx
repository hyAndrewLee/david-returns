import { Crown } from "lucide-react"

export const MemberBanner = () => (
  <div className="mb-6 rounded-[0.375rem] bg-copper-light p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-copper/20 shrink-0">
        <Crown className="h-5 w-5 text-copper" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm">Thank you for being a loyal member!</p>
        <p className="text-xs text-muted-foreground mt-1">
          This pickup is completely free with your unlimited membership.
        </p>
      </div>
    </div>
  </div>
)
