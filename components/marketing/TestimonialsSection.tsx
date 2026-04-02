import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    location: "Williamsburg, Brooklyn",
    text: "David Returns saved me so much time. No more waiting in line at the post office. They picked up right from my apartment building.",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    location: "SoHo, Manhattan",
    text: "The membership is worth every penny. I return stuff all the time and never have to worry about labels or boxes anymore.",
    rating: 5,
  },
  {
    name: "Jessica Wang",
    location: "Chelsea, Manhattan",
    text: "Super convenient and the drivers are always friendly. This is how returns should work everywhere.",
    rating: 5,
  },
]

export const TestimonialsSection = () => (
  <section className='bg-surface-container-low py-20 sm:py-28'>
    <div className='mx-auto max-w-6xl px-4 sm:px-6'>
      <div className='mx-auto max-w-3xl'>
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-copper'>
          What People Are Saying
        </p>
        <h2 className='mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]'>
          Trusted by residents and buildings&nbsp;alike.
        </h2>
      </div>

      <div className='mt-16 grid gap-5 sm:grid-cols-3'>
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className='flex flex-col rounded-[0.375rem] bg-surface-container-lowest p-8 transition-shadow duration-200 hover:shadow-[0_8px_40px_rgba(26,28,27,0.06)]'
          >
            <div className='flex gap-0.5'>
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className='h-3.5 w-3.5 fill-copper text-copper' />
              ))}
            </div>

            <blockquote className='mt-5 flex-1'>
              <p className='leading-relaxed text-foreground'>
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </blockquote>

            <div className='mt-6 pt-5'>
              <div className='h-px w-12 bg-[rgba(26,26,46,0.1)]' />
              <p className='mt-4 text-sm font-semibold text-foreground'>{testimonial.name}</p>
              <p className='text-xs text-muted-foreground'>{testimonial.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)
