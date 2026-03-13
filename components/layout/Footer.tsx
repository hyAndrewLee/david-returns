"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Mail, Linkedin } from "lucide-react"

export const Footer = () => (
  <footer>
    {/* Final CTA */}
    <div id="partner" className="bg-background-dark py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-normal tracking-tight text-white sm:text-4xl lg:text-5xl">
            Bring David Returns to your building.
          </h2>
          <p className="max-w-lg text-lg text-white/70">
            Join the growing network of apartment buildings offering effortless returns for their residents.
          </p>
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/for-buildings#partner"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-background-dark transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              Partner Your Building
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              Schedule a Pickup
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Footer links */}
    <div className="border-t border-white/10 bg-background-dark py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <span className="text-lg font-semibold text-white">David Returns</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Return infrastructure for apartment buildings. We partner with buildings across NYC to make returns effortless for residents.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white">For Buildings</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/for-buildings" className="transition-colors hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/for-buildings#partner" className="transition-colors hover:text-white">
                  Partner with us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-white">
                  Building FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white">For Residents</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/signin" className="transition-colors hover:text-white">
                  Schedule pickup
                </Link>
              </li>
              <li>
                <Link href="/for-residents" className="transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/for-residents#request" className="transition-colors hover:text-white">
                  Request for your building
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/coverage" className="transition-colors hover:text-white">
                  Coverage
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                New York City
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                hello@davidreturns.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} David Returns. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/company/davidreturns/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition-colors hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <div className="flex gap-6 text-sm text-white/40">
              <Link href="/privacy" className="transition-colors hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-white">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
)
