import { Package, Calendar, Truck } from "lucide-react"

const steps = [
  {
    icon: Package,
    number: "01",
    title: "Tell us what you're returning",
    description: "Enter your details and the items you want to send back.",
    gradient: "from-stone-400 to-stone-400",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Select a pickup time",
    description: "Choose a date and time window that works for you. We offer flexible scheduling.",
    gradient: "from-neutral-900 to-neutral-700",
  },
  {
    icon: Truck,
    number: "03",
    title: "Hand to us or leave at door",
    description: "Meet us at the door or leave your package outside. We'll handle the rest and keep you updated.",
    gradient: "from-orange-500 to-orange-400",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background py-20 sm:py-28"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-20 h-64 w-64 rounded-full bg-neutral-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-4 py-1.5 text-sm font-medium text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Simple process
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Three simple steps to hassle-free returns</p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-24 hidden h-0.5 bg-gradient-to-r from-stone-400 via-neutral-900 to-orange-500 opacity-30 sm:block" />

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="group relative">
                {/* Card */}
                <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {/* Gradient accent line at top */}
                  <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${step.gradient}`} />

                  {/* Number badge */}
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-lg font-bold text-white shadow-lg`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="h-7 w-7 text-foreground" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
