import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password | David Returns",
  description: "Reset your David Returns account password.",
}

const ForgotPasswordLayout = ({ children }: { children: React.ReactNode }) => children

export default ForgotPasswordLayout
