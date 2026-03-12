const stats = [
  { value: "30%", label: "of online purchases are returned", emphasis: false },
  { value: "$816B", label: "in returned goods annually in the US", emphasis: true },
  { value: "21", label: "returns per household per year", emphasis: false },
]

export const StatsSection = () => (
  <section className="bg-background-alt py-20 sm:py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
          The Problem
        </span>
        <h2 className="mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
          Online shopping has transformed apartment living. Returns haven&apos;t kept&nbsp;up.
        </h2>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.value} className="text-center">
            <p className={`font-display text-5xl font-normal tracking-tight sm:text-6xl lg:text-7xl ${stat.emphasis ? "text-accent-warm" : "text-foreground"}`}>
              {stat.value}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-12 max-w-2xl text-center text-lg text-muted-foreground">
        Apartment buildings bear the burden &mdash; cluttered package rooms, frustrated tenants, and no infrastructure for outbound returns.
      </p>
    </div>
  </section>
)
