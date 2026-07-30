import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface AccountPageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  breadcrumb?: ReactNode
  className?: string
}

/**
 * Standard page header for every /account/* route. Renders unconditionally —
 * callers must keep it mounted through loading/empty states (fallback title
 * or skeleton content, never omit the header) so the title is never the thing
 * that disappears while data loads.
 */
export function AccountPageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: AccountPageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {breadcrumb}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
