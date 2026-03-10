import { Camera, MapPin, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Verified Pickups",
    description: "Timestamp + photo confirmation",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Updates at every step",
  },
  {
    icon: ShieldCheck,
    title: "Secure Drop-Offs",
    description: "Proof of delivery at retailer or carrier",
  },
]

export const TrustSection = () => {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-4 py-1.5 text-sm font-medium text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Peace of mind
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Your Package, Our Priority
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Every pickup includes verified handoff steps, photo confirmation, and real-time updates — so you always
              know exactly where your package is. From doorstep to drop-off, we treat your item like it's our own.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-6 text-left">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                    <feature.icon className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="relative rounded-3xl border border-border bg-secondary/30 p-8">
              {/* Mock tracking card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Package Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    On the way
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-4 pt-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                        <ShieldCheck className="h-4 w-4 text-white" />
                      </div>
                      <div className="h-full w-0.5 bg-orange-500" />
                    </div>
                    <div className="pb-6">
                      <p className="font-medium text-foreground">Pickup confirmed</p>
                      <p className="text-sm text-muted-foreground">Photo verification complete</p>
                      <p className="mt-1 text-xs text-muted-foreground">Today, 2:30 PM</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="h-full w-0.5 bg-border" />
                    </div>
                    <div className="pb-6">
                      <p className="font-medium text-foreground">In transit</p>
                      <p className="text-sm text-muted-foreground">En route to drop-off</p>
                      <p className="mt-1 text-xs text-muted-foreground">Today, 3:15 PM</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-border">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Drop-off pending</p>
                      <p className="text-sm text-muted-foreground">Estimated: Today, 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-neutral-500/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
