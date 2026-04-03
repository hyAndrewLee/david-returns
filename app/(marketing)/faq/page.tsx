import type { Metadata } from "next"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { FAQSection } from "@/components/marketing/FaqSection"

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | David Returns",
  description:
    "Answers to common questions about David Returns — how it works, pricing, carriers, building partnerships, and more.",
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does David Returns work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upload your return label, schedule a pickup, and we collect from your building. We route your package to the right carrier — UPS, USPS, FedEx, or Happy Returns.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If your building partners with David Returns, pickups are completely free. Otherwise, it's $7.99 per pickup (+$1 for additional packages), or $22.99/month for unlimited.",
      },
    },
    {
      "@type": "Question",
      name: 'What counts as a "package" or return?',
      acceptedAnswer: {
        "@type": "Answer",
        text: "We charge per return label (usually per store) — not per item. Multiple items going back to the same retailer under one label count as one return.",
      },
    },
    {
      "@type": "Question",
      name: "Which carriers do you drop off to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We drop off to Happy Returns, FedEx, UPS, and USPS.",
      },
    },
    {
      "@type": "Question",
      name: "Do I have to be home during pickup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not always. As long as your building allows access or you leave instructions, we can pick up without you present.",
      },
    },
    {
      "@type": "Question",
      name: "When will my return be completed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most returns are completed within 24–48 hours of pickup.",
      },
    },
    {
      "@type": "Question",
      name: "What does it cost for the building?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We work with each building to find a partnership model that fits. Reach out to learn more about pricing and how we can work together.",
      },
    },
    {
      "@type": "Question",
      name: "What infrastructure is required?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "None. No lockers, no kiosks, no dedicated staff. We handle all scheduling, pickup, and carrier routing.",
      },
    },
  ],
}

const FAQPage = () => (
  <main className="min-h-screen">
    <script
      type="application/ld+json"
    >
      {JSON.stringify(faqJsonLd)}
    </script>
    <Navigation />
    <FAQSection />
    <Footer />
  </main>
)

export default FAQPage
