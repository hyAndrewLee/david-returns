import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

const partnerBenefits = [
	'Free unlimited pickups',
	'Scheduled returns at your convenience',
	'No trips to UPS or USPS',
	'No packaging materials needed',
]

const payAsYouGoFeatures = [
	'$7.99 per pickup',
	'+$1 per additional package',
	'Same carrier coverage',
	'Full tracking included',
]

export const ResidentsSection = () => (
	<section className='bg-surface-container-low py-20 sm:py-28'>
		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<div className='mx-auto max-w-3xl'>
				<p className='text-xs font-semibold uppercase tracking-[0.14em] text-copper'>For Residents</p>
				<h2 className='mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]'>
					Returning packages should be&nbsp;effortless.
				</h2>
			</div>

			<div className='mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2'>
				{/* Featured: Partnered building card — elevated with ambient shadow, no hard border */}
				<div className='relative rounded-[0.375rem] bg-surface-container-lowest p-8 shadow-[0_4px_32px_rgba(26,28,27,0.1)] transition-shadow duration-200 hover:shadow-[0_8px_48px_rgba(26,28,27,0.14)]'>
					<div className='absolute -top-3.5 left-6 inline-flex items-center gap-1.5 rounded-[0.375rem] bg-foreground px-4 py-1.5 text-xs font-medium text-on-primary'>
						<Check className='h-3 w-3' />
						Partnered Building
					</div>
					<h3 className='mt-2 text-xl font-semibold text-foreground'>Free for residents</h3>
					<p className='mt-2 text-sm text-muted-foreground'>
						If your building partners with David Returns, pickups are completely free.
					</p>

					<ul className='mt-8 space-y-3'>
						{partnerBenefits.map((benefit) => (
							<li key={benefit} className='flex items-center gap-3 text-sm text-foreground'>
								<div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-green-light'>
									<Check className='h-3 w-3 text-accent-green' />
								</div>
								{benefit}
							</li>
						))}
					</ul>

					<Link
						href='/dashboard'
						className='mt-8 flex w-full items-center justify-center gap-2 rounded-[0.375rem] bg-foreground py-3 text-sm font-medium text-on-primary transition-all hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)] hover:scale-[1.01]'
					>
						Schedule Free Pickup
						<ArrowRight className='h-4 w-4' />
					</Link>
				</div>

				{/* Non-partnered card */}
				<div className='rounded-[0.375rem] bg-surface-container-lowest p-8 transition-shadow duration-200 hover:shadow-[0_8px_40px_rgba(26,28,27,0.06)]'>
					<h3 className='text-xl font-semibold text-foreground'>Pay as you go</h3>
					<p className='mt-2 text-sm text-muted-foreground'>
						Your building isn&apos;t partnered yet? You can still use David Returns.
					</p>

					<ul className='mt-8 space-y-3'>
						{payAsYouGoFeatures.map((feature) => (
							<li key={feature} className='flex items-center gap-3 text-sm text-foreground'>
								<div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-low'>
									<Check className='h-3 w-3 text-muted-foreground' />
								</div>
								{feature}
							</li>
						))}
					</ul>

					<Link
						href='/signup'
						className='mt-8 flex w-full items-center justify-center gap-2 rounded-[0.375rem] border border-[rgba(26,26,46,0.15)] py-3 text-sm font-medium text-foreground transition-all hover:border-[rgba(26,26,46,0.3)] hover:bg-surface-container-low'
					>
						Schedule Pickup
					</Link>

					<div id='request' className='mt-6 rounded-[0.375rem] bg-copper-light p-4 text-center'>
						<p className='text-sm text-foreground/80'>
							Want free pickups?{' '}
							<Link href='/for-residents#request' className='font-medium text-copper underline underline-offset-2'>
								Request David Returns for your building
							</Link>
						</p>
					</div>
				</div>
			</div>

			<p className='mt-10 text-sm text-muted-foreground'>
				Unlimited membership also available &mdash; $22.99/mo for unlimited pickups &amp; packages.
			</p>
		</div>
	</section>
)
