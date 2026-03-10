"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Mail, Package, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="border-b border-background/10 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <h3 className="text-3xl font-semibold sm:text-4xl">Ready to simplify your returns?</h3>
            <p className="max-w-md text-background/70">
              Join thousands of New Yorkers who have made returns hassle-free.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-3 text-sm font-medium text-foreground transition-all hover:scale-105 hover:shadow-lg"
            >
              Schedule your first pickup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/10">
                  <Package className="h-5 w-5 text-background" />
                </div>
                <span className="text-xl font-semibold text-background">David Returns</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-background/70">
                The easiest way to return your online purchases. We pick up from your door so you never have to visit
                the post office again.
              </p>
            </div>

            <div>
              <h4 className="font-medium">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-sm text-background/70">
                <li>
                  <a href="#how-it-works" className="transition-colors hover:text-background">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-background">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/faq" className="transition-colors hover:text-background">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Contact</h4>
              <ul className="mt-4 space-y-3 text-sm text-background/70">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  New York City
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  hello@davidreturns.com
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
            <p className="text-sm text-background/50">
              © {new Date().getFullYear()} David Returns. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://www.linkedin.com/company/davidreturns/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/50 transition-colors hover:text-background"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <div className="flex gap-6 text-sm text-background/50">
                <a href="/privacy" className="transition-colors hover:text-background">
                  Privacy
                </a>
                <a href="/terms" className="transition-colors hover:text-background">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
