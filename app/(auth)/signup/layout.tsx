import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account | David Returns",
  description: "Sign up for David Returns to schedule return pickups from your apartment building.",
}

const SignUpLayout = ({ children }: { children: React.ReactNode }) => children

export default SignUpLayout
