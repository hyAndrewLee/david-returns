import { Upload, CalendarDays, PackageCheck } from 'lucide-react';

const steps = [
	{
		icon: Upload,
		number: '01',
		title: 'Upload your label',
		description: 'Upload or forward your return label in the David Returns platform.',
	},
	{
		icon: CalendarDays,
		number: '02',
		title: 'Schedule pickup',
		description: 'Choose a date and time window. Free for partnered building residents.',
	},
	{
		icon: PackageCheck,
		number: '03',
		title: 'We handle the rest',
		description: 'Packages are picked up and routed to the right carrier — UPS, USPS, FedEx, or Happy Returns.',
	},
];

export const HowItWorks = () => (
	<section id='how-it-works' className='bg-background-alt py-20 sm:py-28'>
		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<div className='mx-auto max-w-2xl text-center'>
				<span className='text-xs font-semibold uppercase tracking-widest text-accent-warm'>How It Works</span>
				<h2 className='mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl'>
					Three steps. Zero&nbsp;hassle.
				</h2>
			</div>

			<div className='mt-16 grid gap-6 sm:grid-cols-3'>
				{steps.map((step) => (
					<div key={step.number} className='group relative'>
						<div className='relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'>
							<span className='font-display text-5xl font-normal text-border/80'>{step.number}</span>

							<div className='mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-accent-warm-light'>
								<step.icon className='h-6 w-6 text-foreground transition-colors group-hover:text-accent-warm' />
							</div>

							<h3 className='mt-5 text-lg font-semibold text-foreground'>{step.title}</h3>
							<p className='mt-3 leading-relaxed text-muted-foreground'>{step.description}</p>
						</div>
					</div>
				))}
			</div>

		</div>
	</section>
);
