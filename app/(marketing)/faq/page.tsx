import type { Metadata } from "next"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { FAQSection } from "@/components/marketing/FaqSection"

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | David Returns",
  description:
    "Answers to common questions about David Returns — how it works, pricing, carriers, building partnerships, and more.",
}

const FAQPage = () => (
  <main className="min-h-screen">
    <Navigation />
    <FAQSection />
    <Footer />
  </main>
)

export default FAQPage
