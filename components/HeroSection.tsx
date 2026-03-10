import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const HeroSection = () => {
  return (
    <section className="overflow-hidden border-b border-border bg-background pb-16 pt-16 sm:pb-24 sm:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Now serving NYC
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Return right from your doorstep.
            </h1>

            <p className="mt-6 text-pretty text-lg italic text-muted-foreground">
              You have better things to do than making returns.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                Schedule a pickup
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                See how it works
              </a>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">Limited pilot — expanding soon to SF, DC, and Atlanta</p>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
            <div className="grid grid-cols-2 gap-3">
              {/* Large featured image - brownstone pickup */}
              <div className="col-span-2 overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                <img
                  src="/images/hero-brownstone.jpg"
                  alt="David Returns worker picking up packages at NYC brownstone doorstep"
                  className="aspect-[2/1] w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Bike courier */}
              <div className="overflow-hidden rounded-xl border border-border bg-background shadow-md">
                <img
                  src="/images/hero-bike.jpg"
                  alt="David Returns bike courier in NYC streets"
                  className="aspect-[4/3] w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Package delivery */}
              <div className="overflow-hidden rounded-xl border border-border bg-background shadow-md">
                <img
                  src="/images/hero-delivery.jpg"
                  alt="David Returns worker delivering package"
                  className="aspect-[4/3] w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* FedEx dropoff - full width bottom */}
              <div className="col-span-2 overflow-hidden rounded-xl border border-border bg-background shadow-md">
                <img
                  src="/images/hero-fedex.jpg"
                  alt="David Returns worker at FedEx Office dropoff"
                  className="aspect-[3/1] w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
