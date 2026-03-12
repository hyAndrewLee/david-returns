export const CarrierPartners = () => (
  <section className="bg-background-alt py-14 sm:py-16">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
        We drop off to every major carrier and return network
      </p>

      <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
        <img
          src="/images/happy-returns-logo.png"
          alt="Happy Returns"
          className="h-8 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-10"
        />
        <img
          src="/images/fedex-logo.png"
          alt="FedEx"
          className="h-10 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-12"
        />
        <img
          src="/images/ups-logo.png"
          alt="UPS"
          className="h-10 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-12"
        />
        <img
          src="/images/usps-logo.png"
          alt="USPS"
          className="h-10 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-12"
        />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        We handle routing to the right destination. You just hand us the package.
      </p>
    </div>
  </section>
)
