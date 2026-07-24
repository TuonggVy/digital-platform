import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'attention'
  href?: string
  className?: string
}

/** Shared metric-card shell used across Admin — the same rounded-2xl/hairline-border/
 *  icon-chip language everywhere a raw count needs to be surfaced (Dashboard and any
 *  future page). `tone="attention"` gives a restrained amber treatment without turning
 *  the card red; `href` makes the whole card a link to the related Admin page. */
export function StatCard({ icon, label, value, hint, tone = 'default', href, className }: StatCardProps) {
  const content = (
    <div
      className={cn(
        'rounded-2xl border bg-background p-5 transition-colors',
        tone === 'attention' ? 'border-amber-500/30' : 'border-border',
        href && 'hover:border-primary/40',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            tone === 'attention' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary',
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-data text-2xl font-semibold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
    </div>
  )

  if (!href) return content

  return (
    <Link to={href} className="block rounded-2xl focus-ring">
      {content}
    </Link>
  )
}
