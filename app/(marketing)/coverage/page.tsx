import type { Metadata } from "next"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Coverage Area — NYC Metro | David Returns",
  description:
    "David Returns serves apartment buildings across Manhattan, Brooklyn, and expanding throughout the NYC metro area.",
}

const CoveragePage = () => (
  <main className="min-h-screen">
    <Navigation />

    {/* Hero — full presence, editorial */}
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-[80vh] flex-col justify-between py-20 sm:py-28">
          <div className="max-w-5xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-warm">
              Our Network
            </span>
            <h1 className="mt-6 font-display text-6xl font-normal leading-[1.02] tracking-[-0.02em] sm:text-7xl lg:text-8xl">
              Serving NYC,<br />
              one building<br />
              at a&nbsp;time.
            </h1>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[rgba(26,26,46,0.08)]">
            <div className="sm:pr-12">
              <p className="font-display text-4xl font-normal text-accent-warm sm:text-5xl">2</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Boroughs Active
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">Manhattan &amp; Brooklyn</p>
            </div>
            <div className="sm:px-12">
              <p className="font-display text-4xl font-normal text-accent-warm sm:text-5xl">NYC</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Metro Area
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">Our home market</p>
            </div>
            <div className="sm:pl-12">
              <p className="font-display text-4xl font-normal text-accent-warm sm:text-5xl">+</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Expanding
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">NJ &amp; beyond, coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
)

export default CoveragePage
