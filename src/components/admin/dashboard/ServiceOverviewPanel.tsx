import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export interface DistributionSegment {
  key: string
  label: string
  count: number
  toneClass: string
}

interface StatusDistributionBarProps {
  segments: DistributionSegment[]
  total: number
  emptyLabel: string
}

/** Lightweight, semantic-HTML proportional bar for a categorical status breakdown —
 *  no charting library, no axes. Counts are always shown as text so the bar is never
 *  the only carrier of the information (segment color is a supporting cue, not the source). */
function StatusDistributionBar({ segments, total, emptyLabel }: StatusDistributionBarProps) {
  const visible = segments.filter((segment) => segment.count > 0)

  if (total === 0 || visible.length === 0) {
    return <p className="text-xs text-text-secondary">{emptyLabel}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-surface"
        role="img"
        aria-label={visible.map((s) => `${s.label}: ${s.count}`).join(', ')}
      >
        {visible.map((segment) => (
          <div
            key={segment.key}
            className={segment.toneClass}
            style={{ width: `${(segment.count / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {visible.map((segment) => (
          <li key={segment.key} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className={cn('inline-block size-1.5 rounded-full', segment.toneClass)} aria-hidden="true" />
            {segment.label}
            <span className="font-data text-text-primary">{segment.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface ServiceOverviewCategory {
  key: string
  label: string
  icon: ReactNode
  href: string
  serviceTotal: number
  serviceSegments: DistributionSegment[]
  serviceEmptyLabel: string
  stock?: {
    label: string
    total: number
    segments: DistributionSegment[]
    emptyLabel: string
  }
}

interface ServiceOverviewPanelProps {
  title: string
  categories: ServiceOverviewCategory[]
  viewAllLabel: string
}

/** One shared shell for Cloud / Kaspersky / eSIM operational status — real counts
 *  from existing service and inventory repositories, no client-computed rates. */
export function ServiceOverviewPanel({ title, categories, viewAllLabel }: ServiceOverviewPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h2 className="font-display text-base font-semibold text-text-primary">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-border">
        {categories.map((category) => (
          <div key={category.key} className="flex flex-col gap-3 lg:px-5 lg:first:pl-0 lg:last:pr-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {category.icon}
                </span>
                {category.label}
              </div>
              <Link to={category.href} className="text-xs font-medium text-primary hover:underline focus-ring">
                {viewAllLabel}
              </Link>
            </div>

            <StatusDistributionBar
              segments={category.serviceSegments}
              total={category.serviceTotal}
              emptyLabel={category.serviceEmptyLabel}
            />

            {category.stock && (
              <div className="mt-1 border-t border-border/70 pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                  {category.stock.label}
                </p>
                <StatusDistributionBar
                  segments={category.stock.segments}
                  total={category.stock.total}
                  emptyLabel={category.stock.emptyLabel}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
