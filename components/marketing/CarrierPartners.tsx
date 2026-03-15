const carriers = [
	{ src: '/images/happy-returns-logo.svg', alt: 'Happy Returns', height: 'h-8 sm:h-10' },
	{ src: '/images/fedex-logo.svg', alt: 'FedEx', height: 'h-8 sm:h-10' },
	{ src: '/images/ups-logo.svg', alt: 'UPS', height: 'h-10 sm:h-12' },
	{ src: '/images/usps-logo.svg', alt: 'USPS', height: 'h-12 sm:h-14' },
]

export const CarrierPartners = () => (
	<section className="bg-background-alt py-14 sm:py-16">
		<div className="mx-auto max-w-6xl px-4 sm:px-6">
			<p className="mb-8 text-center text-sm font-medium text-muted-foreground">
				We drop off to every major carrier and return network
			</p>

			<div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
				{carriers.map((carrier) => (
					<img
						key={carrier.alt}
						src={carrier.src}
						alt={carrier.alt}
						className={`${carrier.height} w-auto object-contain`}
					/>
				))}
			</div>

			<p className="mt-8 text-center text-sm text-muted-foreground">
				We handle routing to the right destination. You just hand us the package.
			</p>
		</div>
	</section>
)
