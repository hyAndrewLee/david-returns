"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Mail, Linkedin } from "lucide-react"

const PARTNER_EMAIL_HREF = "mailto:hello@davidreturns.com?subject=Partner%20My%20Building"

export const Footer = () => (
  <footer>
    {/* Final CTA — dark navy block */}
    <div id="partner" className="bg-surface-dark">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-col items-center gap-6 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
            Ready to outsource the errand of returns?
          </p>
          <h2 className="font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-[#f9f9f6] sm:text-4xl lg:text-[2.75rem]">
            Bring David Returns to your building.
          </h2>
          <p className="text-lg text-[rgba(249,249,246,0.6)]">
            Join the growing network of apartment buildings offering effortless returns for their residents.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <a
              href={PARTNER_EMAIL_HREF}
              className="inline-flex items-center gap-2.5 rounded-[0.375rem] bg-primary-fixed px-7 py-3.5 text-sm font-medium text-on-primary-fixed transition-all hover:shadow-[0_8px_32px_rgba(226,224,252,0.2)] hover:scale-[1.02]"
            >
              Trusted Account
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-[0.375rem] border border-[rgba(249,249,246,0.15)] px-7 py-3.5 text-sm font-medium text-[#f9f9f6] transition-all hover:border-[rgba(249,249,246,0.3)] hover:bg-[rgba(249,249,246,0.05)]"
            >
              Building Partnership
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Footer links — slightly lighter dark surface */}
    <div className="bg-[#13131f] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <span className="text-lg font-semibold text-[#f9f9f6]">David Returns</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[rgba(249,249,246,0.45)]">
              Return infrastructure for apartment buildings. We partner with buildings across NYC to make returns effortless for residents.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[rgba(249,249,246,0.4)]">For Buildings</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[rgba(249,249,246,0.55)]">
              <li>
                <Link href="/for-buildings" className="transition-colors hover:text-[#f9f9f6]">
                  How it works
                </Link>
              </li>
              <li>
                <a href="mailto:hello@davidreturns.com" className="transition-colors hover:text-[#f9f9f6]">
                  Partner with us
                </a>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-[#f9f9f6]">
                  Building FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[rgba(249,249,246,0.4)]">For Residents</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[rgba(249,249,246,0.55)]">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-[#f9f9f6]">
                  Schedule pickup
                </Link>
              </li>
              <li>
                <Link href="/for-residents" className="transition-colors hover:text-[#f9f9f6]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/for-residents#request" className="transition-colors hover:text-[#f9f9f6]">
                  Request for your building
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[rgba(249,249,246,0.4)]">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[rgba(249,249,246,0.55)]">
              <li>
                <Link href="/about" className="transition-colors hover:text-[#f9f9f6]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-[#f9f9f6]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/coverage" className="transition-colors hover:text-[#f9f9f6]">
                  Coverage
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-[#f9f9f6]">
                  Blog
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 opacity-50" />
                New York City
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 opacity-50" />
                hello@davidreturns.com
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-[rgba(249,249,246,0.07)] pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-[rgba(249,249,246,0.3)]">
            &copy; {new Date().getFullYear()} David Returns. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/company/davidreturns/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgba(249,249,246,0.3)] transition-colors hover:text-[#f9f9f6]"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <div className="flex gap-6 text-sm text-[rgba(249,249,246,0.3)]">
              <Link href="/privacy" className="transition-colors hover:text-[#f9f9f6]">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-[#f9f9f6]">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
)
