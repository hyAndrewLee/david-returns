"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </button>
          <Link href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link
            href="/signin"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            Schedule pickup
          </Link>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <button onClick={() => scrollTo("how-it-works")} className="text-left text-sm text-muted-foreground">
              How it works
            </button>
            <button onClick={() => scrollTo("pricing")} className="text-left text-sm text-muted-foreground">
              Pricing
            </button>
            <Link href="/faq" className="text-sm text-muted-foreground">
              FAQ
            </Link>
            <Link
              href="/signin"
              className="mt-2 w-full rounded-full bg-foreground py-2.5 text-center text-sm font-medium text-background transition-all duration-200 hover:shadow-md"
            >
              Schedule pickup
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
