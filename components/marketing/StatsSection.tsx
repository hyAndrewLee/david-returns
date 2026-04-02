const stats = [
  {
    value: "30%",
    label: "of online purchases are returned",
    emphasis: false,
  },
  {
    value: "$816B",
    label: "in returned goods annually in the US",
    emphasis: true,
  },
  {
    value: "21",
    label: "returns per household per year",
    emphasis: false,
  },
]

export const StatsSection = () => (
  <section className='bg-surface-container-low py-20 sm:py-28'>
    <div className='mx-auto max-w-6xl px-4 sm:px-6'>
      <div className='mx-auto max-w-3xl text-center'>
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-copper'>
          The Problem
        </p>
        <h2 className='mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]'>
          Online shopping has transformed apartment living. Returns haven&apos;t kept&nbsp;up.
        </h2>
      </div>

      {/* Full content width so three stats distribute evenly; each column centers its stack */}
      <div className='mt-16 grid w-full grid-cols-1 gap-14 sm:grid-cols-3 sm:gap-8 lg:gap-12'>
        {stats.map((stat) => (
          <div
            key={stat.value}
            className='flex min-w-0 flex-col items-center text-center sm:px-2'
          >
            <p
              className={`font-display text-[5rem] font-normal leading-none tracking-[-0.03em] sm:text-[6rem] lg:text-[7rem] ${
                stat.emphasis ? 'text-copper' : 'text-foreground'
              }`}
            >
              {stat.value}
            </p>
            <p className='mt-4 max-w-56 text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:max-w-none'>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <p className='mx-auto mt-16 max-w-3xl text-center text-lg leading-relaxed text-muted-foreground'>
        Apartment buildings bear the burden &mdash; cluttered package rooms, frustrated tenants, and no infrastructure for outbound returns.
      </p>
    </div>
  </section>
)
