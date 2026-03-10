"use client"

import { useState } from "react"
import { Package, Printer, Clock, MapPin, DollarSign, Timer, Home, Smile, TrendingUp } from "lucide-react"

export function ProblemSection() {
  const [showToday, setShowToday] = useState(false)

  const todaySteps = [
    {
      icon: Package,
      step: "Find a box that fits",
      detail: "Hunt through your apartment or make a trip to buy one",
    },
    {
      icon: Package,
      step: "Find packing tape",
      detail: "Assuming you have any (and it's not dried out)",
    },
    {
      icon: Printer,
      step: "Print the label",
      detail: "Track down a printer, or pay $2 at a print shop",
    },
    {
      icon: MapPin,
      step: "Find the nearest drop-off",
      detail: "Google locations, check hours, plan your route",
    },
    {
      icon: Clock,
      step: "Make the trip",
      detail: "Block time in your schedule, carry the package, commute there",
    },
    {
      icon: DollarSign,
      step: "Wait in line",
      detail: "Just to hand it over and hope you get your refund",
    },
  ]

  const davidOutcomes = [
    {
      icon: Timer,
      label: "Time saved",
      value: "2+ hours",
      detail: "Back in your week",
    },
    {
      icon: Home,
      label: "Trips required",
      value: "0",
      detail: "We come to you",
    },
    {
      icon: DollarSign,
      label: "Materials cost",
      value: "$0",
      detail: "No boxes or tape",
    },
    {
      icon: Smile,
      label: "Your sanity",
      value: "Priceless",
      detail: "Shop with confidence",
    },
  ]

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="relative container mx-auto px-4">
        {/* Emotional headline */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">The reality of returns</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            Your time is worth more than a return line
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Returns shouldn't take up space in your head, schedule, or apartment. See the difference:
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative flex items-center justify-center gap-4 bg-muted/50 rounded-full p-2 border border-border">
            {/* Sliding background */}
            <div
              className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-background border border-border rounded-full shadow-sm transition-all duration-300 ease-out ${
                showToday ? "left-2" : "left-[calc(50%+4px)]"
              }`}
            />

            {/* Toggle buttons */}
            <button
              onClick={() => setShowToday(true)}
              className={`relative z-10 flex-1 py-3 px-6 text-sm font-semibold rounded-full transition-colors duration-200 ${
                showToday ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setShowToday(false)}
              className={`relative z-10 flex-1 py-3 px-6 text-sm font-semibold rounded-full transition-colors duration-200 ${
                !showToday ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              With David Returns
            </button>
          </div>
        </div>

        {/* The comparison - animated transition */}
        <div className="max-w-4xl mx-auto">
          <div
            className={`rounded-2xl p-8 md:p-12 transition-all duration-500 ${
              showToday ? "bg-muted/30 border border-border/50 shadow-sm" : "bg-card border border-primary/20 shadow-lg"
            }`}
          >
            {showToday ? (
              <div key="today" className="animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">Today: The 6-step hassle</h3>
                </div>

                <div className="space-y-6">
                  {todaySteps.map((item, index) => (
                    <div key={index} className="flex gap-4 group" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors">
                        <item.icon className="w-6 h-6 text-muted-foreground transition-colors" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-lg mb-1">{item.step}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.detail}</p>
                      </div>
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-border">
                  <div className="flex flex-wrap justify-center gap-8 mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-muted-foreground mb-1">2+ hours</p>
                      <p className="text-sm text-muted-foreground">Time wasted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-muted-foreground mb-1">3 trips</p>
                      <p className="text-sm text-muted-foreground">Minimum required</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-muted-foreground mb-1">$10+</p>
                      <p className="text-sm text-muted-foreground">Materials cost</p>
                    </div>
                  </div>
                  <p className="text-center text-lg text-muted-foreground italic">
                    Getting your money back shouldn't feel this hard.
                  </p>
                </div>
              </div>
            ) : (
              <div key="david" className="animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-12">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">What you get back</h3>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {davidOutcomes.map((item, index) => {
                    const colorClasses = [
                      "bg-blue-100 dark:bg-blue-950",
                      "bg-orange-100 dark:bg-orange-950",
                      "bg-green-100 dark:bg-green-950",
                      "bg-green-100 dark:bg-green-950",
                    ]
                    const iconColors = [
                      "text-blue-600 dark:text-blue-400",
                      "text-orange-600 dark:text-orange-400",
                      "text-green-600 dark:text-green-400",
                      "text-green-600 dark:text-green-400",
                    ]

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center text-center"
                        style={{ animationDelay: `${index * 75}ms` }}
                      >
                        <div
                          className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${colorClasses[index]}`}
                        >
                          <item.icon className={`w-8 h-8 ${iconColors[index]}`} />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          {item.label}
                        </p>
                        <p className="text-3xl font-bold text-foreground mb-2">{item.value}</p>
                        <p className="text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-12 pt-8 border-t border-primary/20">
                  <p className="text-center text-xl font-medium text-foreground">
                    Returns made simple. Get back to what matters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
