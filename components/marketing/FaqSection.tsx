'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FaqCategory = 'residents' | 'buildings';

const faqsByCategory: Record<FaqCategory, { question: string; answer: string }[]> = {
	residents: [
		{
			question: 'How does David Returns work?',
			answer:
				'Upload your return label, schedule a pickup, and we collect from your building. We route your package to the right carrier — UPS, USPS, FedEx, or Happy Returns.',
		},
		{
			question: 'How much does it cost?',
			answer:
				"If your building partners with David Returns, pickups are completely free. Otherwise, it's $7 per pickup (+$1 for additional packages), or $14.99/month for unlimited.",
		},
		{
			question: 'What counts as a "package" or return?',
			answer:
				'We charge per return label (usually per store) — not per item. Multiple items going back to the same retailer under one label count as one return.',
		},
		{
			question: 'What do I need to provide?',
			answer:
				"A return label or QR code, the retailer name, and your pickup address. If anything is missing, we'll contact you before pickup.",
		},
		{
			question: 'Which carriers do you drop off to?',
			answer: 'We drop off to Happy Returns, FedEx, UPS, and USPS.',
		},
		{
			question: 'Do I have to be home during pickup?',
			answer:
				'Not always. As long as your building allows access or you leave instructions, we can pick up without you present.',
		},
		{
			question: 'When will my return be completed?',
			answer: 'Most returns are completed within 24–48 hours of pickup.',
		},
		{
			question: 'When will I receive my refund?',
			answer: 'Refund timing is controlled by the retailer. We mark your return complete once we drop it off.',
		},
		{
			question: 'Can I reschedule or cancel?',
			answer: 'Yes. Contact us at hello@davidreturns.com at least 24 hours before your scheduled pickup.',
		},
		{
			question: 'What if my item is lost or damaged?',
			answer:
				"We're responsible for your item until it's dropped off. After that, the retailer's or carrier's policy applies.",
		},
		{
			question: 'Are there size or item limits?',
			answer: 'We accept most standard items. Oversized, hazardous, perishable, or restricted items may not qualify.',
		},
		{
			question: 'How do I contact support?',
			answer: 'Text us at (706) 308-8865 or email hello@davidreturns.com.',
		},
	],
	buildings: [
		{
			question: 'What does it cost for the building?',
			answer:
				'We work with each building to find a partnership model that fits. Reach out to learn more about pricing and how we can work together.',
		},
		{
			question: 'What infrastructure is required?',
			answer: 'None. No lockers, no kiosks, no dedicated staff. We handle all scheduling, pickup, and carrier routing.',
		},
		{
			question: 'How does the partnership work?',
			answer:
				'The building signs a simple agreement. Residents gain access to free return pickups. David Returns handles all logistics.',
		},
		{
			question: 'What kind of buildings are a good fit?',
			answer:
				'Buildings with 50+ units, active e-commerce residents, and a doorman or package room. We currently serve the NYC metro area.',
		},
		{
			question: 'How does this help with package rooms?',
			answer:
				'Returns often sit in package rooms and lobbies for days. We pick them up regularly, reducing clutter and freeing up space.',
		},
		{
			question: 'How do residents sign up?',
			answer:
				'Once your building partners with us, residents can create a free account and start scheduling pickups immediately.',
		},
		{
			question: 'How do I get started?',
			answer:
				'Email us at hello@davidreturns.com or visit our For Buildings page to learn more. We can have your building set up within a week.',
		},
	],
};

const categories: { key: FaqCategory; label: string }[] = [
	{ key: 'residents', label: 'For Residents' },
	{ key: 'buildings', label: 'For Buildings' },
];

export const FAQSection = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const [activeCategory, setActiveCategory] = useState<FaqCategory>('residents');

	const activeFaqs = faqsByCategory[activeCategory];

	return (
		<section id='faq' className='bg-background-alt py-20 sm:py-28'>
			<div className='mx-auto max-w-3xl px-4 sm:px-6'>
				<div className='mx-auto max-w-2xl text-center'>
					<span className='text-xs font-semibold uppercase tracking-widest text-accent-warm'>FAQ</span>
					<h2 className='mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl'>
						Frequently asked questions
					</h2>
					<p className='mt-4 text-muted-foreground'>Everything you need to know about David Returns</p>
				</div>

				{/* Category tabs */}
				<div className='mt-10 flex justify-center'>
					<div className='inline-flex rounded-full border border-border bg-card p-1 shadow-sm'>
						{categories.map((cat) => (
							<button
								key={cat.key}
								onClick={() => {
									setActiveCategory(cat.key);
									setOpenIndex(null);
								}}
								className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
									activeCategory === cat.key
										? 'bg-foreground text-background shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								{cat.label}
							</button>
						))}
					</div>
				</div>

				<div className='mt-10 space-y-3'>
					{activeFaqs.map((faq, index) => (
						<div
							key={faq.question}
							className={`overflow-hidden rounded-xl border bg-card transition-all ${
								openIndex === index ? 'border-foreground/30 shadow-md' : 'border-border'
							}`}
						>
							<button
								onClick={() => setOpenIndex(openIndex === index ? null : index)}
								className='flex w-full items-center justify-between px-5 py-4 text-left'
							>
								<span className='pr-4 font-medium text-foreground'>{faq.question}</span>
								<div
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
										openIndex === index ? 'bg-foreground' : 'bg-secondary'
									}`}
								>
									<ChevronDown
										className={`h-4 w-4 transition-all duration-200 ${
											openIndex === index ? 'rotate-180 text-background' : 'text-foreground'
										}`}
									/>
								</div>
							</button>
							<div
								className={`grid transition-all duration-200 ${
									openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
								}`}
							>
								<div className='overflow-hidden'>
									<p className='px-5 pb-4 leading-relaxed text-muted-foreground'>{faq.answer}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
