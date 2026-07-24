import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant =
  'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-emerald-500/10 text-emerald-600',
  warning: 'bg-amber-500/10 text-amber-600',
  danger: 'bg-red-500/10 text-red-600',
  neutral: 'bg-surface text-text-secondary border border-border',
}

// Same colors don't read on the navy PageHeader background (e.g. `neutral`'s
// light-gray text/border), so a dark counterpart is needed there — mirrors the
// tone pattern already used by Input/Checkbox/Breadcrumb for dark surfaces.
const darkVariantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-white/10 text-home-wire',
  secondary: 'bg-white/10 text-white/80',
  accent: 'bg-white/10 text-home-wire',
  success: 'bg-emerald-400/15 text-emerald-300',
  warning: 'bg-amber-400/15 text-amber-300',
  danger: 'bg-red-400/15 text-red-300',
  neutral: 'bg-white/10 text-white/70 border border-white/15',
}

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  /** 'dark' renders the badge for a dark/navy surface (e.g. PageHeader's meta slot). */
  tone?: 'light' | 'dark'
  className?: string
}

export function Badge({ children, variant = 'neutral', tone = 'light', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'dark' ? darkVariantClasses[variant] : variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
