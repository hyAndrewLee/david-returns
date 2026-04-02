import Image from 'next/image'
import { ArrowRight, Package, Home, Zap, Heart } from 'lucide-react'

const PARTNER_EMAIL_HREF = 'mailto:hello@davidreturns.com?subject=Partner%20My%20Building'

const benefits = [
  {
    icon: Package,
    title: 'Reduce Package Room Clutter',
    description: 'Returns sit in lobbies and package rooms. We remove them regularly.',
  },
  {
    icon: Home,
    title: 'Improve Tenant Experience',
    description: 'Seamless returns are the amenity tenants didn\'t know they needed.',
  },
  {
    icon: Zap,
    title: 'Zero Infrastructure',
    description: 'No lockers. No kiosks. No staff burden. We handle everything.',
  },
  {
    icon: Heart,
    title: 'One More Reason to Stay In',
    description: 'Tenants love buildings that simplify their lives.',
  },
]

export const BuildingsSection = () => (
  <section className='bg-surface-dark overflow-hidden'>
    <div className='mx-auto max-w-6xl'>
      <div className='grid lg:grid-cols-[1fr_40%]'>
        {/* Left: content */}
        <div className='px-4 py-24 sm:px-8 sm:py-32 lg:pr-16'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-copper'>
            The Human Element
          </p>
          <h2 className='mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-[#f9f9f6] sm:text-4xl lg:text-[2.75rem]'>
            Why apartment buildings partner with&nbsp;us.
          </h2>

          <div className='mt-12 grid gap-5 sm:grid-cols-2'>
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className='rounded-[0.375rem] bg-[rgba(249,249,246,0.04)] p-6 transition-all duration-200 hover:bg-[rgba(249,249,246,0.07)]'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-[0.375rem] bg-copper/20'>
                  <benefit.icon className='h-5 w-5 text-copper' strokeWidth={1.5} />
                </div>
                <h3 className='mt-4 text-base font-semibold text-[#f9f9f6]'>{benefit.title}</h3>
                <p className='mt-2 text-sm leading-relaxed text-[rgba(249,249,246,0.55)]'>{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className='mt-12'>
            <a
              href={PARTNER_EMAIL_HREF}
              className='inline-flex items-center gap-2.5 rounded-[0.375rem] bg-primary-fixed px-7 py-3.5 text-sm font-medium text-on-primary-fixed transition-all hover:shadow-[0_8px_32px_rgba(226,224,252,0.2)] hover:scale-[1.02]'
            >
              Partner Your Building
              <ArrowRight className='h-4 w-4' />
            </a>
          </div>
        </div>

        {/* Right: editorial photo bleeds to edge */}
        <div className='relative min-h-[360px] lg:min-h-0'>
          <Image
            src='/images/stitch-building-manager.jpg'
            alt='Building manager reviewing logistics dashboard in a modern office'
            fill
            className='object-cover object-center'
          />
          {/* Left blend into dark section */}
          <div className='absolute inset-y-0 left-0 w-20 bg-linear-to-r from-surface-dark to-transparent' />
          {/* Dark overlay for drama */}
          <div className='absolute inset-0 bg-[#1a1a2e]/30' />
        </div>
      </div>
    </div>
  </section>
)
