import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Breadcrumb, type BreadcrumbItem } from '@/components/common/Breadcrumb'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  /** Renders a Breadcrumb trail above the title — used by detail pages nested under a list. */
  breadcrumb?: BreadcrumbItem[]
  /** Trailing content next to the title (e.g. a status badge on a detail page). */
  meta?: ReactNode
  /** Renders a back icon button before the title (e.g. return to the parent list page). */
  onBack?: () => void
}

/** Shared header for every Admin page — list pages pass just title/description/action;
 *  detail pages additionally pass breadcrumb/meta so they no longer need to hand-roll
 *  an equivalent-but-different header. Plain title block on the white main surface —
 *  no card chrome — mirrored by AdminDashboardHeader on the Dashboard (which adds its
 *  own refresh/status affordances) so every Admin page opens with the same header feel. */
export function PageHeader({ title, description, action, breadcrumb, meta, onBack }: PageHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-6 flex flex-col gap-3">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label={t('common.back')}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-admin-text-muted transition-colors hover:bg-black/[0.04] hover:text-admin-text focus-ring"
              >
                <ArrowLeft aria-hidden="true" className="size-5" />
              </button>
            )}
            <h1 className="font-display text-2xl font-semibold text-admin-text sm:text-3xl">{title}</h1>
            {meta}
          </div>
          {description && <div className="mt-1 max-w-md text-sm text-admin-text-muted">{description}</div>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>
  )
}
