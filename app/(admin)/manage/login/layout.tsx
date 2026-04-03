import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login | David Returns",
  description: "Sign in to the David Returns admin dashboard.",
}

const AdminLoginLayout = ({ children }: { children: React.ReactNode }) => children

export default AdminLoginLayout
