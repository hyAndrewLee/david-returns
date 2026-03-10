"use client"
import { Printer, Package, Scissors } from "lucide-react"
import Link from "next/link"

const items = [
  {
    question: "No printer?",
    answer: "We'll print it.",
    icon: Printer,
  },
  {
    question: "No box?",
    answer: "We'll bring one.",
    icon: Package,
  },
  {
    question: "No tape?",
    answer: "We'll seal it up.",
    icon: Scissors,
  },
]

export function PackagingSection() {
  return (
    <section className="py-20 md:py-28 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 text-center">
          Packaging? <span className="text-orange-500 italic">Not your problem.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-8 text-center hover:border-orange-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-xl font-medium text-neutral-500 mb-1">{item.question}</p>
                <p className="text-xl font-semibold text-neutral-900">{item.answer}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            More questions? Check our FAQ
            <span className="text-orange-500">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
