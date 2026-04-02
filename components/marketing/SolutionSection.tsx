import Image from 'next/image'
import { Check } from 'lucide-react'
import Link from 'next/link'

const benefits = [
	'Pickup from your lobby — no trips to UPS or USPS',
	'We collect directly from residents on a schedule',
	'Buildings see reduced package room congestion',
	'Routed to the right carrier automatically',
]

export const SolutionSection = () => (
	<section className='bg-surface overflow-hidden'>
		<div className='mx-auto max-w-6xl'>
			<div className='grid lg:grid-cols-[1fr_44%]'>
				{/* Left: editorial text column */}
				<div className='flex flex-col justify-center px-4 py-20 sm:px-8 lg:py-28 lg:pr-16'>
					<p className='text-xs font-semibold uppercase tracking-[0.14em] text-copper'>
						The Solution
					</p>
					<h2 className='mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]'>
						The Luxury of<br />Reclaimed Time.
					</h2>
					<p className='mt-5 text-lg leading-relaxed text-muted-foreground max-w-md'>
						We bridge the gap between your building and the carrier door. Every David Returns courier is trained in residential etiquette and large-format bag management — professional, reliable, on your schedule.
					</p>

					<ul className='mt-8 space-y-3'>
						{benefits.map((benefit) => (
							<li key={benefit} className='flex items-start gap-3 text-sm text-foreground'>
								<div className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-copper-light'>
									<Check className='h-3 w-3 text-copper' strokeWidth={2.5} />
								</div>
								{benefit}
							</li>
						))}
					</ul>

					<div className='mt-10'>
						<Link
							href='/#how-it-works'
							className='text-sm font-medium text-copper transition-colors hover:text-foreground'
						>
							See how it works &rarr;
						</Link>
					</div>
				</div>

				{/* Right: photo column bleeding to the edge */}
				<div className='relative min-h-[360px] lg:min-h-0'>
					<Image
						src='/images/stitch-parcels-door.jpg'
						alt='Professionally packaged parcels by a modern apartment door'
						fill
						className='object-cover object-center'
					/>
					{/* Subtle left edge blend */}
					<div className='absolute inset-y-0 left-0 w-16 bg-linear-to-r from-surface to-transparent' />
				</div>
			</div>
		</div>
	</section>
)
