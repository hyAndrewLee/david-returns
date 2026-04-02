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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(249,249,246,0.88)] backdrop-blur-md shadow-[0_1px_0_rgba(26,26,46,0.06)]"
          : "bg-[rgba(249,249,246,0.72)] backdrop-blur-md"
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
              className={`px-3 py-2 text-sm transition-colors rounded-[0.375rem] ${
                pathname === link.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-[0.375rem] hover:bg-surface-container-low"
          >
            Schedule Pickup
          </Link>
          <a
            href={PARTNER_EMAIL_HREF}
            className="rounded-[0.375rem] bg-primary text-on-primary px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)] hover:bg-primary/90"
          >
            Partner Your Building
          </a>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-[0.375rem] p-2 text-muted-foreground hover:bg-surface-container-low lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="bg-[rgba(249,249,246,0.96)] backdrop-blur-md px-4 py-4 lg:hidden shadow-[0_8px_24px_rgba(26,26,46,0.08)]">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[0.375rem] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 pt-3">
              <Link
                href="/dashboard"
                className="rounded-[0.375rem] border border-[rgba(26,26,46,0.15)] py-2.5 text-center text-sm font-medium text-foreground transition-all hover:bg-surface-container-low"
              >
                Schedule Pickup
              </Link>
              <a
                href={PARTNER_EMAIL_HREF}
                className="rounded-[0.375rem] bg-primary py-2.5 text-center text-sm font-medium text-on-primary transition-all hover:shadow-md"
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
