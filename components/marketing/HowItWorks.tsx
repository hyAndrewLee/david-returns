import Image from 'next/image'

const steps = [
	{
		image: '/images/stitch-ritual-phone.jpg',
		imageAlt: 'Smartphone displaying a minimalist pickup request interface',
		number: '01',
		title: 'Request Pickup',
		description: 'Upload your return label in the app. No printing, no boxing required.',
	},
	{
		image: '/images/stitch-ritual-concierge.jpg',
		imageAlt: 'Professional concierge in navy uniform collecting a package',
		number: '02',
		title: 'We Collect',
		description: 'A David Returns courier comes to your building at your scheduled window.',
	},
	{
		image: '/images/stitch-ritual-label.jpg',
		imageAlt: 'Shipping label being applied to a package with precision',
		number: '03',
		title: 'Return Complete',
		description: 'We route your package to UPS, USPS, FedEx, or Happy Returns — fully tracked.',
	},
]

export const HowItWorks = () => (
	<section id='how-it-works' className='bg-surface-container-low py-20 sm:py-28'>
		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<div className='mx-auto max-w-2xl'>
				<p className='text-xs font-semibold uppercase tracking-[0.14em] text-copper'>
					The Ritual of Ease
				</p>
				<h2 className='mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]'>
					Three steps. Zero&nbsp;hassle.
				</h2>
			</div>

			<div className='mt-16 grid gap-6 sm:grid-cols-3'>
				{steps.map((step) => (
					<div key={step.number} className='group'>
						{/* Photo fills the top of each card */}
						<div className='relative h-60 overflow-hidden rounded-[0.375rem] sm:h-72'>
							<Image
								src={step.image}
								alt={step.imageAlt}
								fill
								className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]'
							/>
							{/* Subtle bottom scrim so number stays readable */}
							<div className='absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[rgba(26,26,46,0.5)] to-transparent' />
							<span className='absolute bottom-4 left-4 font-display text-3xl font-normal leading-none text-[rgba(249,249,246,0.7)]'>
								{step.number}
							</span>
						</div>

						{/* Caption below the photo */}
						<div className='mt-5'>
							<h3 className='text-base font-semibold text-foreground'>{step.title}</h3>
							<p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{step.description}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	</section>
)
