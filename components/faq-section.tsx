"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How does David Returns work?",
    answer:
      "Book a pickup and we'll collect your item from your door. We prepare your return and take it to the shipping carrier or retail store for you.",
  },
  {
    question: "How much does David Returns cost?",
    answer: "Each pickup is $5. Unlimited pickups are available for $14.99/month.",
  },
  {
    question: 'What counts as a "package" or return?',
    answer:
      "We charge per return label (usually per store) - not per item. Multiple items going back to the same retailer under one label count as one return. Returns to different stores count as separate returns.",
  },
  {
    question: "Is a membership required?",
    answer: "No. You can book a single return or subscribe anytime.",
  },
  {
    question: "What do I need to provide for my return?",
    answer:
      "For carrier drop-offs (UPS / USPS / FedEx): Return label or QR code, retailer name, pickup address and contact info, and special handling instructions (if any). For in-store returns: Store name and location, order number, receipt or proof of purchase (if required), return barcode or authorization (if provided by the retailer), and any ID required by the store's return policy. If anything is missing, we'll contact you before pickup.",
  },
  {
    question: "Where do you return items?",
    answer: "We return items to major carriers and directly to retail stores.",
  },
  {
    question: "Are all stores supported?",
    answer:
      "Most major retailers are supported. Some stores may not accept third-party returns — if that happens, we'll let you know.",
  },
  {
    question: "What happens if a store or carrier refuses my return?",
    answer: "We'll notify you right away and help you decide next steps.",
  },
  {
    question: "Are there size or item limits?",
    answer: "We accept most standard items. Oversized, hazardous, perishable, or restricted items may not qualify.",
  },
  {
    question: "When will I receive my refund?",
    answer: "Refund timing is controlled by the retailer. We mark your return complete once we drop it off.",
  },
  {
    question: "When should I expect my return to be completed?",
    answer: "Most returns are completed within 24-48 hours of pickup.",
  },
  {
    question: "Do I have to be home during pickup?",
    answer:
      "Not always. As long as your building allows access or you leave instructions, we can pick up without you present.",
  },
  {
    question: "Can I reschedule or cancel?",
    answer: "Yes. To reschedule or cancel, please contact us at hello@davidreturns.com at least 24 hours before your scheduled pickup.",
  },
  {
    question: "Where is David Returns available?",
    answer: "We currently operate in NYC, with plans to expand soon.",
  },
  {
    question: "What if my item is lost or damaged?",
    answer:
      "We're responsible for your item until it's dropped off. After that, the retailer's or carrier's policy applies.",
  },
  {
    question: "How do I contact support?",
    answer: "You can text us directly at (706) 308-8865 or email us at hello@davidreturns.com.",
  },
]

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-foreground">
            <HelpCircle className="h-5 w-5 text-background" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to know about David Returns</p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded-xl border bg-card transition-all ${
                openIndex === index ? "border-foreground shadow-md" : "border-border"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-5 py-2 text-left"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    openIndex === index ? "bg-foreground" : "bg-secondary"
                  }`}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-all duration-200 ${
                      openIndex === index ? "rotate-180 text-background" : "text-foreground"
                    }`}
                  />
                </div>
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-3 text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
