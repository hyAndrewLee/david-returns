"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { FAQSection } from "@/components/faq-section"

const FAQPage = () => (
  <main className="min-h-screen bg-background">
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/david-returns-logo.png"
            alt="David Returns"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </header>
    <FAQSection />
  </main>
)

export default FAQPage
