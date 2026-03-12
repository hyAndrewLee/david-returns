import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    location: "Williamsburg, Brooklyn",
    text: "David Returns saved me so much time. No more waiting in line at the post office. They picked up right from my apartment building.",
    rating: 5,
    type: "resident" as const,
  },
  {
    name: "Michael Rodriguez",
    location: "SoHo, Manhattan",
    text: "The membership is worth every penny. I return stuff all the time and never have to worry about labels or boxes anymore.",
    rating: 5,
    type: "resident" as const,
  },
  {
    name: "Jessica Wang",
    location: "Chelsea, Manhattan",
    text: "Super convenient and the drivers are always friendly. This is how returns should work everywhere.",
    rating: 5,
    type: "resident" as const,
  },
]

export const TestimonialsSection = () => (
  <section className="bg-background-alt py-20 sm:py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
          What People Are Saying
        </span>
        <h2 className="mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
          Trusted by residents and buildings&nbsp;alike.
        </h2>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent-warm text-accent-warm" />
              ))}
            </div>

            <blockquote className="mt-4">
              <p className="leading-relaxed text-foreground">
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </blockquote>

            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)
