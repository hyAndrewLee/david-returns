import Image from 'next/image'

const carriers = [
	{ src: '/images/happy-returns.png', alt: 'Happy Returns', height: 'h-8 sm:h-10' },
	{ src: '/images/fedex-logo.svg', alt: 'FedEx', height: 'h-8 sm:h-10' },
	{ src: '/images/ups-logo.svg', alt: 'UPS', height: 'h-8 sm:h-10' },
	{ src: '/images/usps-logo.svg', alt: 'USPS', height: 'h-8 sm:h-10' },
]

export const CarrierPartners = () => (
	<section className='bg-surface py-14 sm:py-16'>
		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<p className='mb-10 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground text-center'>
				We drop off to every major carrier and return network
			</p>

			<div className='flex flex-wrap items-center justify-center gap-10 sm:gap-16'>
				{carriers.map((carrier) => (
					<Image
						key={carrier.alt}
						src={carrier.src}
						alt={carrier.alt}
						width={120}
						height={48}
						className={`${carrier.height} w-auto object-contain opacity-50 transition-opacity hover:opacity-80`}
					/>
				))}
			</div>

			<p className='mt-10 text-center text-sm text-muted-foreground'>
				We handle routing to the right destination. You just hand us the package.
			</p>
		</div>
	</section>
)
