import { Home, Building2, Truck } from "lucide-react"
import Link from "next/link"

const pillars = [
  {
    icon: Home,
    title: "For Residents",
    description: "Scheduled pickups from your apartment. No trips to UPS. No packaging stress.",
  },
  {
    icon: Building2,
    title: "For Buildings",
    description: "Reduced package room congestion and clutter. Happy tenants, zero infrastructure cost.",
  },
  {
    icon: Truck,
    title: "For the City",
    description: "Fewer individual carrier trips. Consolidated logistics across the neighborhood.",
  },
]

export const SolutionSection = () => (
  <section className="bg-background py-20 sm:py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
          The Solution
        </span>
        <h2 className="mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
          Return infrastructure, delivered to your&nbsp;building.
        </h2>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warm-light">
              <pillar.icon className="h-6 w-6 text-accent-warm" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{pillar.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{pillar.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/#how-it-works"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-warm transition-colors hover:text-foreground"
        >
          Learn how it works &rarr;
        </Link>
      </div>
    </div>
  </section>
)
