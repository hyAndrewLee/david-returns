import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

const partnerBenefits = [
	'Free unlimited pickups',
	'Scheduled returns at your convenience',
	'No trips to UPS or USPS',
	'No packaging materials needed',
];

const payAsYouGoFeatures = [
	'$7.99 per pickup',
	'+$1 per additional package',
	'Same carrier coverage',
	'Full tracking included',
];

export const ResidentsSection = () => (
	<section className='bg-background py-20 sm:py-28'>
		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<div className='mx-auto max-w-3xl text-center'>
				<span className='text-xs font-semibold uppercase tracking-widest text-accent-warm'>For Residents</span>
				<h2 className='mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl'>
					Returning packages should be&nbsp;effortless.
				</h2>
			</div>

			<div className='mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2'>
				{/* Partnered building card */}
				<div className='relative rounded-2xl border-2 border-foreground bg-card p-8 shadow-lg'>
					<div className='absolute -top-3.5 left-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background'>
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
						className='mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background transition-all hover:scale-[1.02] hover:shadow-md'
					>
						Schedule Free Pickup
						<ArrowRight className='h-4 w-4' />
					</Link>
				</div>

				{/* Non-partnered card */}
				<div className='rounded-2xl border border-border bg-card p-8 shadow-sm'>
					<h3 className='text-xl font-semibold text-foreground'>Pay as you go</h3>
					<p className='mt-2 text-sm text-muted-foreground'>
						Your building isn&apos;t partnered yet? You can still use David Returns.
					</p>

					<ul className='mt-8 space-y-3'>
						{payAsYouGoFeatures.map((feature) => (
							<li key={feature} className='flex items-center gap-3 text-sm text-foreground'>
								<div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary'>
									<Check className='h-3 w-3 text-muted-foreground' />
								</div>
								{feature}
							</li>
						))}
					</ul>

					<Link
						href='/signup'
						className='mt-8 flex w-full items-center justify-center gap-2 rounded-full border-2 border-border py-3 text-sm font-medium text-foreground transition-all hover:border-foreground hover:shadow-md'
					>
						Schedule Pickup
					</Link>

					<div id='request' className='mt-6 rounded-xl bg-accent-warm-light/50 p-4 text-center'>
						<p className='text-sm text-foreground/80'>
							Want free pickups?{' '}
							<Link href='/for-residents#request' className='font-medium text-accent-warm underline underline-offset-2'>
								Request David Returns for your building
							</Link>
						</p>
					</div>
				</div>
			</div>

			<p className='mt-10 text-center text-sm text-muted-foreground'>
				Unlimited membership also available &mdash; $22.99/mo for unlimited pickups &amp; packages.
			</p>
		</div>
	</section>
);
