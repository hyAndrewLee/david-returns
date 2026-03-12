import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { MapPin } from "lucide-react"

const neighborhoods = [
  {
    borough: "Manhattan",
    areas: ["SoHo", "West Village", "Chelsea", "Upper East Side", "Upper West Side", "Midtown"],
  },
  {
    borough: "Brooklyn",
    areas: ["Williamsburg", "DUMBO", "Park Slope", "Greenpoint", "Brooklyn Heights"],
  },
  {
    borough: "Expanding Soon",
    areas: ["Hoboken", "Jersey City", "Long Island City", "Astoria"],
  },
]

const CoveragePage = () => (
  <main className="min-h-screen">
    <Navigation />

    {/* Hero */}
    <section className="bg-background pb-16 pt-16 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
            Our Network
          </span>
          <h1 className="mt-4 font-display text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
            Serving apartment buildings across&nbsp;NYC.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Our network is growing. See if your neighborhood is&nbsp;covered.
          </p>
        </div>
      </div>
    </section>

    {/* Map placeholder + neighborhoods */}
    <section className="bg-background-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Map placeholder */}
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex aspect-video items-center justify-center bg-linear-to-br from-background-alt to-background p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-warm-light">
                <MapPin className="h-8 w-8 text-accent-warm" />
              </div>
              <p className="mt-4 font-display text-2xl font-normal text-foreground">NYC Metro Area</p>
              <p className="mt-2 text-muted-foreground">Manhattan &middot; Brooklyn &middot; Expanding to NJ</p>
            </div>
          </div>
        </div>

        {/* Neighborhood list */}
        <div className="mx-auto mt-16 max-w-4xl grid gap-8 sm:grid-cols-3">
          {neighborhoods.map((group) => (
            <div key={group.borough}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-accent-warm">
                {group.borough}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.areas.map((area) => (
                  <li key={area} className="flex items-center gap-2 text-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
          <h2 className="font-display text-2xl font-normal tracking-tight sm:text-3xl">
            Don&apos;t see your neighborhood?
          </h2>
          <p className="mt-3 text-muted-foreground">
            We&apos;re expanding rapidly. Let us know where you are and we&apos;ll prioritize your&nbsp;area.
          </p>
          <div className="mt-8">
            <a
              href="mailto:hello@davidreturns.com?subject=Coverage Request"
              className="inline-flex items-center gap-1 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              Request Coverage
            </a>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
)

export default CoveragePage
