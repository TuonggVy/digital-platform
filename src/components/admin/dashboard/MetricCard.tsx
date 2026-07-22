import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  tone?: 'default' | 'attention'
  href?: string
  className?: string
}

/** Dashboard-scoped primary metric card. Visually related to the shared StatCard
 *  (same rounded-2xl/hairline-border/icon-chip language used across Admin) but kept
 *  separate so restyling it never touches StatCard's other call sites. */
export function MetricCard({ icon, label, value, tone = 'default', href, className }: MetricCardProps) {
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
    </div>
  )

  if (!href) return content

  return (
    <Link to={href} className="block rounded-2xl focus-ring">
      {content}
    </Link>
  )
}
