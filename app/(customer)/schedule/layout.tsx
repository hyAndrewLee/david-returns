import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Schedule a Pickup | David Returns",
  description:
    "Schedule a return pickup from your apartment. Choose a date, enter your address, add your items, and we handle the rest.",
}

const ScheduleLayout = ({ children }: { children: React.ReactNode }) => children

export default ScheduleLayout
