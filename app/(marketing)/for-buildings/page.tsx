import type { Metadata } from "next"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { ArrowRight, Package, Smile, Zap, Heart, Building2, Users, ShieldCheck } from "lucide-react"

const benefits = [
  {
    icon: Package,
    title: "Reduce Package Room Clutter",
    description: "Returns sit in package rooms and lobbies for days. We pick them up regularly so your spaces stay clean.",
  },
  {
    icon: Smile,
    title: "Improve Tenant Satisfaction",
    description: "Returns are a top tenant pain point. Offer hassle-free pickups as a building amenity that sets you apart.",
  },
  {
    icon: Zap,
    title: "Zero Infrastructure Required",
    description: "No lockers. No kiosks. No dedicated staff. We handle everything from scheduling to carrier routing.",
  },
  {
    icon: Heart,
    title: "One More Reason to Stay In",
    description: "Gyms, lounges, rooftops — tenants love buildings that simplify their lives. Add return pickups to the list of amenities they never want to leave behind.",
  },
]

const steps = [
  {
    number: "01",
    title: "Building partners with David Returns",
    description: "Simple agreement, no setup costs or infrastructure changes required.",
  },
  {
    number: "02",
    title: "Residents gain free pickup access",
    description: "Tenants in your building can schedule unlimited free return pickups.",
  },
  {
    number: "03",
    title: "David Returns handles logistics",
    description: "We manage scheduling, pickup, and routing to UPS, USPS, FedEx, or Happy Returns.",
  },
]

const idealBuilding = [
  { icon: Building2, text: "50+ units" },
  { icon: Users, text: "Active e-commerce residents" },
  { icon: ShieldCheck, text: "Doorman or package room" },
  { icon: Package, text: "NYC metro area" },
]

const PARTNER_EMAIL_HREF = "mailto:hello@davidreturns.com?subject=Partner%20My%20Building"

export const metadata: Metadata = {
  title: "For Buildings — Partner with David Returns",
  description:
    "Reduce package room clutter and improve tenant satisfaction. Partner your building with David Returns for seamless return logistics — zero infrastructure required.",
}

const ForBuildingsPage = () => (
  <main className="min-h-screen">
    <Navigation />

    {/* Hero */}
    <section className="bg-background pb-20 pt-16 sm:pb-28 sm:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
            For Property Managers
          </span>
          <h1 className="mt-4 font-display text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
            Upgrade your building&apos;s package&nbsp;experience.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            David Returns provides seamless return logistics for residents &mdash; zero infrastructure, minimal effort, and happier&nbsp;tenants.
          </p>
          <div className="mt-10">
            <a
              href={PARTNER_EMAIL_HREF}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              Partner Your Building
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* Benefits */}
    <section className="bg-background-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Why buildings partner with&nbsp;us.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warm-light">
                <benefit.icon className="h-6 w-6 text-accent-warm" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{benefit.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How partnerships work */}
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
            How partnerships work.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting started takes minutes, not months.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
            >
              <span className="font-display text-3xl font-normal text-accent-warm">{step.number}</span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Ideal buildings */}
    <section className="bg-background-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Ideal building profile.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            David Returns works best in buildings with high e-commerce activity.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
          {idealBuilding.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <item.icon className="h-5 w-5 shrink-0 text-accent-warm" />
              <span className="font-medium text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </main>
)

export default ForBuildingsPage
