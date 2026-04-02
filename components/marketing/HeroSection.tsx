import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const PARTNER_EMAIL_HREF = 'mailto:hello@davidreturns.com?subject=Partner%20My%20Building'

export const HeroSection = () => (
	<section className='relative min-h-[88vh] overflow-hidden'>
		{/* Full-bleed background — branded brownstone photo */}
		<div className='absolute inset-0 -z-10'>
			<Image
				src='/images/stitch-hero-lobby.jpg'
				alt='Luxury apartment building lobby with marble floors and warm ambient lighting'
				fill
				className='object-cover object-center'
				priority
			/>
			{/* Navy overlay with left-weighted gradient so text stays legible */}
			<div className='absolute inset-0 bg-[#1a1a2e]/60' />
			<div className='absolute inset-0 bg-linear-to-r from-[#1a1a2e]/90 via-[#1a1a2e]/55 to-transparent' />
			<div className='absolute inset-0 bg-linear-to-t from-[#1a1a2e]/50 via-transparent to-transparent' />
		</div>

		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<div className='flex min-h-[88vh] flex-col justify-center py-24'>
				{/* Asymmetric: text occupies left ~60% */}
				<div className='max-w-[62%] xl:max-w-[56%]'>
					<p className='mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(249,249,246,0.55)]'>
						New York City
					</p>

					<h1 className='font-display text-[3.5rem] font-normal leading-[1.08] tracking-[-0.02em] text-[#f9f9f6] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6rem]'>
						Package Returns,<br />
						Made Effortless.
					</h1>

					<p className='mt-7 max-w-md text-lg leading-relaxed text-[rgba(249,249,246,0.72)] sm:text-xl'>
						We bridge the gap between your apartment and the carrier door. Full-service returns for high-density living.
					</p>

					<div className='mt-10 flex flex-col gap-3 sm:flex-row'>
						<a
							href={PARTNER_EMAIL_HREF}
							className='inline-flex items-center gap-2.5 rounded-[0.375rem] bg-primary-fixed px-7 py-3.5 text-sm font-medium text-on-primary-fixed transition-all duration-200 hover:shadow-[0_8px_32px_rgba(226,224,252,0.25)] hover:scale-[1.02]'
						>
							Partner Your Building
							<ArrowRight className='h-4 w-4' />
						</a>
						<Link
							href='/dashboard'
							className='inline-flex items-center gap-2 rounded-[0.375rem] border border-[rgba(249,249,246,0.22)] bg-[rgba(249,249,246,0.06)] px-7 py-3.5 text-sm font-medium text-[#f9f9f6] backdrop-blur-sm transition-all duration-200 hover:border-[rgba(249,249,246,0.4)] hover:bg-[rgba(249,249,246,0.1)]'
						>
							Schedule a Pickup
						</Link>
					</div>
				</div>
			</div>
		</div>

		{/* Subtle bottom fade into surface */}
		<div className='absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#f9f9f6] to-transparent' />
	</section>
)
