import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary: lavender fill with deep navy text — the "authority CTA"
        default:
          'rounded-[0.375rem] bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed/90 hover:shadow-[0_4px_20px_rgba(26,26,46,0.12)]',
        // Dark authority — deep navy fill
        primary:
          'rounded-[0.375rem] bg-primary text-on-primary hover:bg-primary/90 hover:shadow-[0_4px_20px_rgba(26,26,46,0.15)]',
        destructive:
          'rounded-[0.375rem] bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
        // Ghost border — surface lowest + low-opacity border
        outline:
          'rounded-[0.375rem] bg-surface-container-lowest border border-[rgba(26,26,46,0.15)] hover:bg-surface-container-low hover:border-[rgba(26,26,46,0.25)]',
        secondary:
          'rounded-[0.375rem] bg-surface-container-low text-foreground hover:bg-surface-container-lowest',
        ghost:
          'rounded-[0.375rem] hover:bg-surface-container-low hover:text-foreground',
        link: 'text-copper underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
