import type { ReactNode } from 'react'
import { Breadcrumb, type BreadcrumbItem } from '@/components/common/Breadcrumb'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  /** Renders a Breadcrumb trail above the title — used by detail pages nested under a list. */
  breadcrumb?: BreadcrumbItem[]
  /** Trailing content next to the title (e.g. a status badge on a detail page). */
  meta?: ReactNode
}

/** Shared header for every Admin page — list pages pass just title/description/action;
 *  detail pages additionally pass breadcrumb/meta so they no longer need to hand-roll
 *  an equivalent-but-different header. Styled as the same compact navy card used by
 *  AdminDashboardHeader on the Dashboard, so every Admin page opens with the same
 *  header "frame" — no refresh/status logic here, just the shared visual shell. */
export function PageHeader({ title, description, action, breadcrumb, meta }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-home-line/15 bg-home-ink px-5 py-4 sm:px-6 sm:py-5">
      {breadcrumb && <Breadcrumb items={breadcrumb} tone="dark" />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl font-semibold text-white sm:text-2xl">{title}</h1>
            {meta}
          </div>
          {description && <div className="mt-1 max-w-md text-sm text-white/60">{description}</div>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>
  )
}
