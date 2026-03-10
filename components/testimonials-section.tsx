"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    location: "Brooklyn, NY",
    text: "David Returns saved me so much time. No more waiting in line at the post office. They picked up right from my apartment!",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    location: "Manhattan, NY",
    text: "The membership is worth every penny. I return stuff all the time and never have to worry about labels or boxes anymore.",
    rating: 5,
  },
  {
    name: "Jessica Wang",
    location: "Queens, NY",
    text: "Super convenient and the drivers are always friendly. This is how returns should work everywhere.",
    rating: 5,
  },
  {
    name: "David Thompson",
    location: "Brooklyn, NY",
    text: "Game changer for someone who shops online a lot. The instant pickup option is clutch when I need something returned fast.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section className="bg-secondary/20 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What our customers are saying</h2>
          <p className="mt-4 text-muted-foreground">Real feedback from real New Yorkers</p>
        </div>

        <div className="relative mt-16">
          {/* Testimonial card */}
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-lg sm:p-12">
              {/* Stars */}
              <div className="mb-6 flex justify-center gap-1">
                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-orange-400 text-orange-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-center">
                <p className="text-lg leading-relaxed text-foreground sm:text-xl">
                  "{testimonials[currentIndex].text}"
                </p>
              </blockquote>

              {/* Author */}
              <div className="mt-8 text-center">
                <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[currentIndex].location}</p>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={goToPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-secondary"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "w-8 bg-foreground" : "w-2 bg-border"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-secondary"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
