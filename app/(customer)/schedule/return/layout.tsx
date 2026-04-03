import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Confirmation | David Returns",
  description: "Your payment is being processed. Please wait while we confirm your pickup.",
}

const PaymentReturnLayout = ({ children }: { children: React.ReactNode }) => children

export default PaymentReturnLayout
