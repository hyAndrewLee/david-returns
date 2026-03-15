import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Check, ArrowRight, Upload, CalendarDays, PackageCheck } from 'lucide-react';

const partnerBenefits = [
	'Free unlimited pickups',
	'Scheduled returns at your convenience',
	'No trips to UPS or USPS',
	'No packaging materials needed',
	'Full tracking from pickup to drop-off',
];

const payFeatures = [
	{ label: 'Per pickup', value: '$7' },
	{ label: 'Additional package', value: '+$1' },
	{ label: 'Unlimited membership', value: '$14.99/mo' },
];

const steps = [
	{ icon: Upload, title: 'Upload your label', description: 'Upload or forward your return label in the platform.' },
	{ icon: CalendarDays, title: 'Schedule pickup', description: 'Choose a date and time that works for you.' },
	{
		icon: PackageCheck,
		title: 'We handle it',
		description: 'We pick up and route to UPS, USPS, FedEx, or Happy Returns.',
	},
];

const ForResidentsPage = () => (
	<main className='min-h-screen'>
		<Navigation />

		{/* Hero */}
		<section className='bg-background pb-20 pt-16 sm:pb-28 sm:pt-20'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6'>
				<div className='mx-auto max-w-3xl text-center'>
					<span className='text-xs font-semibold uppercase tracking-widest text-accent-warm'>For Residents</span>
					<h1 className='mt-4 font-display text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl'>
						Returning packages should be&nbsp;effortless.
					</h1>
					<p className='mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl'>
						Whether your building partners with David Returns or not, we make returns simple.
					</p>
				</div>
			</div>
		</section>

		{/* Partnered building benefits */}
		<section className='bg-background-alt py-20 sm:py-28'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6'>
				<div className='mx-auto max-w-3xl'>
					<div className='rounded-2xl border-2 border-accent-green bg-card p-8 shadow-lg sm:p-10'>
						<div className='inline-flex items-center gap-2 rounded-full bg-accent-green-light px-4 py-1.5 text-sm font-medium text-accent-green'>
							<Check className='h-4 w-4' />
							Your building is partnered
						</div>

						<h2 className='mt-6 font-display text-2xl font-normal tracking-tight sm:text-3xl'>
							Free pickups for partnered building residents.
						</h2>
						<p className='mt-3 text-muted-foreground'>
							If your building partners with David Returns, all return pickups are completely free. No limits, no fees.
						</p>

						<ul className='mt-8 space-y-3'>
							{partnerBenefits.map((benefit) => (
								<li key={benefit} className='flex items-center gap-3 text-foreground'>
									<div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-green-light'>
										<Check className='h-3 w-3 text-accent-green' />
									</div>
									{benefit}
								</li>
							))}
						</ul>

						<div className='mt-8'>
							<Link
								href='/signin'
								className='inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all hover:scale-[1.02] hover:shadow-lg'
							>
								Schedule Free Pickup
								<ArrowRight className='h-4 w-4' />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>

		{/* Non-partnered */}
		<section className='bg-background py-20 sm:py-28'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6'>
				<div className='mx-auto max-w-3xl'>
					<h2 className='font-display text-2xl font-normal tracking-tight sm:text-3xl'>
						Your building isn&apos;t partnered yet?
					</h2>
					<p className='mt-3 text-muted-foreground'>
						You can still use David Returns. Same great service, simple pricing.
					</p>

					<div className='mt-8 grid gap-4 sm:grid-cols-3'>
						{payFeatures.map((feature) => (
							<div key={feature.label} className='rounded-xl border border-border bg-card p-6 text-center shadow-sm'>
								<p className='font-display text-3xl font-normal text-foreground'>{feature.value}</p>
								<p className='mt-2 text-sm text-muted-foreground'>{feature.label}</p>
							</div>
						))}
					</div>

					<div className='mt-8'>
						<Link
							href='/signup'
							className='inline-flex items-center gap-2 rounded-full border-2 border-border px-8 py-3.5 text-sm font-medium text-foreground transition-all hover:border-foreground hover:shadow-md'
						>
							Get Started
						</Link>
					</div>

					<div id='request' className='mt-12 rounded-2xl bg-accent-warm-light/50 p-8'>
						<h3 className='text-lg font-semibold text-foreground'>Want free pickups?</h3>
						<p className='mt-2 text-muted-foreground'>
							Request David Returns for your building. We&apos;ll reach out to your property management team to set up a
							partnership.
						</p>
						<a
							href='mailto:hello@davidreturns.com?subject=Request David Returns for my building'
							className='mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-warm transition-colors hover:text-foreground'
						>
							Send a request &rarr;
						</a>
					</div>
				</div>
			</div>
		</section>

		{/* How it works */}
		<section className='bg-background-alt py-20 sm:py-28'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6'>
				<div className='mx-auto max-w-3xl text-center'>
					<h2 className='font-display text-2xl font-normal tracking-tight sm:text-3xl'>How it works.</h2>
				</div>

				<div className='mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3'>
					{steps.map((step) => (
						<div key={step.title} className='rounded-2xl border border-border bg-card p-6 text-center shadow-sm'>
							<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warm-light'>
								<step.icon className='h-6 w-6 text-accent-warm' />
							</div>
							<h3 className='mt-4 font-semibold text-foreground'>{step.title}</h3>
							<p className='mt-2 text-sm text-muted-foreground'>{step.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>

		<Footer />
	</main>
);

export default ForResidentsPage;
