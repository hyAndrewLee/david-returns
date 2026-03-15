import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Pickup Scheduled | David Returns",
  description: "Your return pickup has been successfully scheduled.",
}

const ScheduleSuccessPage = async () => (
  <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">Return Successfully Placed!</h1>

      <p className="text-gray-600 mb-8">
        Your return has been scheduled. Track your pickup status and get updates in your dashboard.
      </p>

      <Link href="/dashboard">
        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 text-base font-medium">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  </div>
)

export default ScheduleSuccessPage
