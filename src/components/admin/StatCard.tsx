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

/** Shared metric-card shell used across Admin — the same soft-shadow/hairline-border/
 *  icon-chip language everywhere a raw count needs to be surfaced (Dashboard and any
 *  future page). `tone="attention"` gives a restrained amber treatment without turning
 *  the card red; `href` makes the whole card a link to the related Admin page. */
export function StatCard({ icon, label, value, hint, tone = 'default', href, className }: StatCardProps) {
  const content = (
    <div
      className={cn(
        'rounded-admin-lg border bg-admin-surface p-5 shadow-admin-card transition-colors',
        tone === 'attention' ? 'border-amber-500/30' : 'border-admin-border',
        href && 'hover:border-admin-primary/40',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-admin-text-muted">{label}</span>
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            tone === 'attention' ? 'bg-amber-500/10 text-amber-600' : 'bg-admin-primary-soft text-admin-primary',
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-data text-3xl font-semibold tabular-nums text-admin-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-admin-text-muted">{hint}</p>}
    </div>
  )

  if (!href) return content

  return (
    <Link to={href} className="block rounded-admin-lg focus-ring">
      {content}
    </Link>
  )
}
