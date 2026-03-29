"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

const PARTNER_EMAIL_HREF = "mailto:hello@davidreturns.com?subject=Partner%20My%20Building"

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Buildings", href: "/for-buildings" },
  { label: "For Residents", href: "/for-residents" },
  { label: "Coverage", href: "/coverage" },
  { label: "About", href: "/about" },
]

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const prevPathname = useRef(pathname)
  if (prevPathname.current !== pathname) {
    prevPathname.current = pathname
    if (mobileMenuOpen) setMobileMenuOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === link.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/dashboard"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Schedule Pickup
          </Link>
          <a
            href={PARTNER_EMAIL_HREF}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            Partner Your Building
          </a>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-border py-2.5 text-center text-sm font-medium text-foreground transition-all hover:bg-secondary"
              >
                Schedule Pickup
              </Link>
              <a
                href={PARTNER_EMAIL_HREF}
                className="rounded-full bg-foreground py-2.5 text-center text-sm font-medium text-background transition-all hover:shadow-md"
              >
                Partner Your Building
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
