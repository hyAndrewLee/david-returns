import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const PARTNER_EMAIL_HREF = 'mailto:hello@davidreturns.com?subject=Partner%20My%20Building';

export const HeroSection = () => (
	<section className='relative overflow-hidden border-b border-border pb-20 pt-16 sm:pb-28 sm:pt-20'>
		<div className='absolute inset-0 -z-10'>
			<Image
				src='/images/hero-bg-nyc.jpg'
				alt=''
				fill
				className='object-cover'
				priority
			/>
			<div className='absolute inset-0 bg-background/50' />
			<div className='absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-background/40' />
		</div>

		<div className='mx-auto max-w-6xl px-4 sm:px-6'>
			<div className='mx-auto max-w-3xl text-center'>
				<h1 className='font-display text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl'>
					Return infrastructure for apartment&nbsp;living.
				</h1>

				<p className='mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl'>
					David Returns partners with apartment buildings to provide seamless return pickups for residents. No trips. No
					lines. No effort.
				</p>

				<div className='mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
					<a
						href={PARTNER_EMAIL_HREF}
						className='inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all duration-200 hover:scale-[1.02] hover:shadow-lg'
					>
						Partner Your Building
						<ArrowRight className='h-4 w-4' />
					</a>
					<Link
						href='/dashboard'
						className='inline-flex items-center gap-2 rounded-full border-2 border-border bg-background/60 px-8 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-200 hover:border-foreground hover:shadow-md'
					>
						Schedule a Pickup
					</Link>
				</div>
			</div>
		</div>
	</section>
);
