import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const freePlanBullets = ['No per-pickup fees', 'No packaging needed', 'Same carrier coverage'];

const PricingOnboardingChoice = () => (
	<section className='bg-background py-20 sm:py-28'>
		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<div className='mx-auto max-w-3xl text-center'>
				<h2 className='font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl'>
					Choose how you want to return
				</h2>
				<p className='mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg'>
					Start now &mdash; switch to free when your building joins.
				</p>
			</div>

			<div className='mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2'>
				<article className='group relative flex h-full flex-col rounded-2xl border-2 border-accent-green/40 bg-card p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent-green/60 hover:shadow-lg sm:p-9'>
					<div className='absolute -top-3 left-6 rounded-full border border-accent-green/30 bg-accent-green-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-green'>
						Recommended
					</div>

					<div className='mt-3'>
						<h3 className='font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl'>Free with your building</h3>
						<p className='mt-3 text-muted-foreground'>Your building covers the cost &mdash; every return is free.</p>
					</div>

					<ul className='mt-8 space-y-3'>
						{freePlanBullets.map((bullet) => (
							<li key={bullet} className='flex items-center gap-3 text-sm text-foreground sm:text-base'>
								<span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-green-light'>
									<Check className='h-3.5 w-3.5 text-accent-green' />
								</span>
								{bullet}
							</li>
						))}
					</ul>

					<div className='mt-auto pt-10'>
						<Link
							href='/signin'
							className='inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:text-base'
						>
							Schedule Free Pickup
						</Link>

						<span className='invisible mt-4 inline-flex h-5 items-center text-sm font-medium'>Get free pickups in your building</span>
					</div>
				</article>

				<article className='group flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md sm:p-9'>
					<div>
						<h3 className='font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl'>Pay per return</h3>
						<p className='mt-3 text-muted-foreground'>Use anytime. Switch to free when your building joins.</p>
					</div>

					<div className='mt-8 rounded-xl border border-border/80 bg-background-alt/60 p-5'>
						<div className='space-y-3'>
							<div className='flex items-baseline justify-between gap-3'>
								<span className='font-display text-3xl font-normal text-foreground'>$7.99</span>
								<span className='text-sm text-muted-foreground'>per pickup</span>
							</div>
							<div className='flex items-baseline justify-between gap-3'>
								<span className='font-display text-3xl font-normal text-foreground'>+$1</span>
								<span className='text-sm text-muted-foreground'>per extra package</span>
							</div>
						</div>

						<div className='my-5 border-t border-border/80' />

						<div className='flex items-baseline justify-between gap-3'>
							<span className='text-sm font-medium text-foreground'>Unlimited</span>
							<span className='font-display text-2xl font-normal text-foreground'>$22.99/month</span>
						</div>
					</div>

					<div className='mt-auto space-y-4 pt-10'>
						<Link
							href='/signup'
							className='inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-background-alt sm:text-base'
						>
							Schedule Pickup
						</Link>

						<a
							href='mailto:hello@davidreturns.com?subject=Get free pickups in my building'
							className='inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
						>
							Get free pickups in your building
							<ArrowRight className='h-4 w-4' />
						</a>
					</div>
				</article>
			</div>
		</div>
	</section>
);

export { PricingOnboardingChoice };
