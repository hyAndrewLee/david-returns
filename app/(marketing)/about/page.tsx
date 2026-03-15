import type { Metadata } from "next"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Building2, Package, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us — Why David Returns Exists",
  description:
    "David Returns builds return infrastructure for apartment buildings in NYC. Residents get free pickups, buildings get happier tenants.",
}

const AboutPage = () => (
  <main className="min-h-screen">
    <Navigation />

    {/* Hero */}
    <section className="bg-background pb-16 pt-16 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
            Why David Returns exists.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Online shopping made buying easy. Returns are still&nbsp;broken.
          </p>
        </div>
      </div>
    </section>

    {/* Story */}
    <section className="bg-background-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-normal tracking-tight sm:text-3xl">
            The story.
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              In New York City, millions of packages arrive at apartment buildings every day. Buying online is effortless &mdash; a few taps and it shows up at your door.
            </p>
            <p>
              But returning? That means finding a box, printing a label, trekking to UPS, and waiting in line. For apartment dwellers without printers or easy carrier access, it&apos;s a real headache.
            </p>
            <p>
              We started David Returns because we believed there had to be a better way. And we found it: <span className="font-medium text-foreground">apartment buildings themselves</span>.
            </p>
            <p>
              By partnering with buildings, we create return pickup nodes where people already live. Residents get free, scheduled pickups. Buildings get happier tenants and cleaner package rooms. Everyone wins.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
            Our Mission
          </span>
          <h2 className="mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Build the infrastructure layer for e-commerce returns in dense&nbsp;cities.
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warm-light">
              <Building2 className="h-6 w-6 text-accent-warm" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Buildings as Nodes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Apartment buildings are the most logical place for return infrastructure.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warm-light">
              <Package className="h-6 w-6 text-accent-warm" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Consolidated Logistics</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Multiple pickups per building, routed efficiently to carriers.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warm-light">
              <MapPin className="h-6 w-6 text-accent-warm" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">NYC First</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Dominating the densest city first, then expanding to other metros.
            </p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
)

export default AboutPage
