import type { Metadata } from 'next';
import { CalendarDays, PackageCheck, Upload } from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PricingOnboardingChoice } from '@/components/marketing/PricingOnboardingChoice';

const steps = [
	{ icon: Upload, title: 'Upload your label', description: 'Upload or forward your return label in the platform.' },
	{ icon: CalendarDays, title: 'Schedule pickup', description: 'Choose a date and time that works for you.' },
	{
		icon: PackageCheck,
		title: 'We handle it',
		description: 'We pick up and route to UPS, USPS, FedEx, or Happy Returns.',
	},
];

export const metadata: Metadata = {
	title: 'For Residents — Free Return Pickups | David Returns',
	description:
		'Schedule free return pickups from your apartment. Upload your label, pick a time, and we handle the rest — UPS, USPS, FedEx, or Happy Returns.',
};

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

		<PricingOnboardingChoice />

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
