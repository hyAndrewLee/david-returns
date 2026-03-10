export const RetailersSection = () => {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            We handle returns from any online store.
          </h2>

          <div className="mt-10 flex items-center justify-center gap-16 sm:gap-20">
            <img src="/images/fedex-logo.png" alt="FedEx" className="h-14 w-auto object-contain sm:h-16" />
            <img src="/images/ups-logo.png" alt="UPS" className="h-14 w-auto object-contain sm:h-16" />
            <img src="/images/usps-logo.png" alt="USPS" className="h-14 w-auto object-contain sm:h-16" />
          </div>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-300 to-orange-400"></div>
            <span className="rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600 ring-1 ring-orange-200">
              Plus direct-to-store returns
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-orange-300 to-orange-400"></div>
          </div>

          <div className="mt-8">
            <p className="mb-6 text-xl font-medium text-foreground sm:text-2xl">
              We take it all the way. <span className="text-black italic underline">Straight back to the store.</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <img
                src="/images/zara-logo.png"
                alt="Zara"
                className="h-10 w-auto object-contain grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100 sm:h-12"
              />
              <img
                src="/images/banana-republic-logo.png"
                alt="Banana Republic"
                className="h-10 w-auto object-contain grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100 sm:h-12"
              />
              <img
                src="/images/aritzia-logo.png"
                alt="Aritzia"
                className="h-10 w-auto rounded-lg bg-neutral-900 px-3 py-1.5 object-contain opacity-70 transition-all hover:opacity-100 sm:h-12"
              />
              <img
                src="/images/rag-bone-logo.png"
                alt="Rag & Bone"
                className="h-10 w-auto object-contain grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100 sm:h-12"
              />
              <img
                src="/images/abercrombie-logo.png"
                alt="Abercrombie & Fitch"
                className="h-10 w-auto object-contain grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100 sm:h-12"
              />
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              ...and anywhere else you need
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
                <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                Just let us know
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
