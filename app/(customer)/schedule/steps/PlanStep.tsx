'use client'

import { Check, Sparkles } from 'lucide-react'
import { useSchedule } from '@/app/(customer)/schedule/ScheduleContext'

export const PlanStep = () => {
	const { formData, setFormData } = useSchedule()

	return (
		<div className='space-y-8'>
			<div>
				<span className='text-xs font-semibold uppercase tracking-widest text-copper'>Plan</span>
				<h1 className='mt-2 font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl'>
					Choose your plan
				</h1>
				<p className='mt-3 text-muted-foreground'>Select the option that works best for you.</p>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<button
					onClick={() => setFormData((prev) => ({ ...prev, plan: 'Pay-As-You-Go' }))}
					className={`relative flex flex-col rounded-[0.375rem] border-2 p-6 text-left transition-all duration-200 ${
						formData.plan === 'Pay-As-You-Go'
							? 'border-primary bg-surface-container-lowest shadow-[0_4px_32px_rgba(26,28,27,0.1)]'
							: 'border-transparent bg-surface-container-lowest hover:shadow-[0_4px_20px_rgba(26,28,27,0.06)] hover:-translate-y-0.5'
					}`}
				>
					{formData.plan === 'Pay-As-You-Go' && (
						<div className='absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary'>
							<Check className='h-4 w-4' />
						</div>
					)}
					<h3 className='text-lg font-semibold text-foreground'>One-time pickup</h3>
					<div className='mt-3'>
						<span className='font-display text-3xl font-normal text-foreground'>$7.99</span>
						<span className='text-muted-foreground'> per pickup</span>
					</div>
					<p className='mt-1 text-sm text-muted-foreground'>+ $1 per additional package</p>
					<ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
						<li className='flex items-center gap-2'>
							<Check className='h-4 w-4 text-accent-green' strokeWidth={1.5} /> Free label printing
						</li>
						<li className='flex items-center gap-2'>
							<Check className='h-4 w-4 text-accent-green' strokeWidth={1.5} /> Free shipping boxes
						</li>
						<li className='flex items-center gap-2'>
							<Check className='h-4 w-4 text-accent-green' strokeWidth={1.5} /> No per-pickup fees
						</li>
						<li className='flex items-center gap-2'>
							<Sparkles className='h-4 w-4 text-copper' strokeWidth={1.5} /> Cancel anytime
						</li>
					</ul>
				</button>

				<button
					onClick={() => setFormData((prev) => ({ ...prev, plan: 'Membership' }))}
					className={`relative flex flex-col rounded-[0.375rem] border-2 p-6 text-left transition-all duration-200 ${
						formData.plan === 'Membership'
							? 'border-copper bg-surface-container-lowest shadow-[0_4px_32px_rgba(136,81,39,0.15)]'
							: 'border-transparent bg-surface-container-lowest hover:shadow-[0_4px_20px_rgba(26,28,27,0.06)] hover:-translate-y-0.5'
					}`}
				>
					<span className='absolute -top-3 left-4 rounded-[0.375rem] bg-copper px-3 py-0.5 text-xs font-medium text-white'>
						Best value
					</span>
					{formData.plan === 'Membership' && (
						<div className='absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-copper text-white'>
							<Check className='h-4 w-4' />
						</div>
					)}
					<h3 className='text-lg font-semibold text-foreground'>Unlimited</h3>
					<div className='mt-3'>
						<span className='font-display text-3xl font-normal text-foreground'>$22.99</span>
						<span className='text-muted-foreground'> / month</span>
					</div>
					<p className='mt-1 text-sm text-copper font-medium'>Unlimited pickups &amp; packages</p>
					<ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
						<li className='flex items-center gap-2'>
							<Check className='h-4 w-4 text-accent-green' strokeWidth={1.5} /> Free label printing
						</li>
						<li className='flex items-center gap-2'>
							<Check className='h-4 w-4 text-accent-green' strokeWidth={1.5} /> Free shipping boxes
						</li>
						<li className='flex items-center gap-2'>
							<Check className='h-4 w-4 text-accent-green' strokeWidth={1.5} /> Priority scheduling
						</li>
						<li className='flex items-center gap-2'>
							<Sparkles className='h-4 w-4 text-copper' strokeWidth={1.5} /> Cancel anytime
						</li>
					</ul>
				</button>
			</div>
		</div>
	)
}
