import Link from "next/link"
import { ArrowRight, Package, Home, Zap, Heart } from "lucide-react"

const PARTNER_EMAIL_HREF = "mailto:hello@davidreturns.com?subject=Partner%20My%20Building"

const benefits = [
  {
    icon: Package,
    title: "Reduce Package Room Clutter",
    description: "Returns sit in lobbies and package rooms. We remove them regularly.",
  },
  {
    icon: Home,
    title: "Improve Tenant Experience",
    description: "Seamless returns are the amenity tenants didn't know they needed.",
  },
  {
    icon: Zap,
    title: "Zero Infrastructure",
    description: "No lockers. No kiosks. No staff burden. We handle everything.",
  },
  {
    icon: Heart,
    title: "One More Reason to Stay In",
    description: "Tenants love buildings that simplify their lives. Add return pickups to the amenities they never want to leave behind.",
  },
]

export const BuildingsSection = () => (
  <section className="bg-background-dark py-24 sm:py-32">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
          Designed for Density
        </span>
        <h2 className="mt-4 font-display text-3xl font-normal tracking-tight text-white sm:text-4xl lg:text-5xl">
          Why apartment buildings partner with&nbsp;us.
        </h2>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-warm/20">
              <benefit.icon className="h-5 w-5 text-accent-warm" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">{benefit.title}</h3>
            <p className="mt-2 leading-relaxed text-white/60">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <a
          href={PARTNER_EMAIL_HREF}
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-background-dark transition-all hover:scale-[1.02] hover:shadow-lg"
        >
          Partner Your Building
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  </section>
)
