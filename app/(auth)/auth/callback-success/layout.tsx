import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email Confirmed | David Returns",
  description: "Your email has been confirmed. You can now sign in to your account.",
}

const CallbackSuccessLayout = ({ children }: { children: React.ReactNode }) => children

export default CallbackSuccessLayout
