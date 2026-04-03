import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | David Returns",
  description: "Sign in to your David Returns account to manage your return pickups.",
}

const SignInLayout = ({ children }: { children: React.ReactNode }) => children

export default SignInLayout
