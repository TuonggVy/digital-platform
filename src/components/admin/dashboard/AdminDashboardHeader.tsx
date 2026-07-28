import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useLocale } from '@/hooks/useLocale'
import { formatDateTime } from '@/utils/formatters'

export type DashboardHealthStatus = 'loading' | 'healthy' | 'attention' | 'unknown'

const STATUS_DOT_CLASS: Record<DashboardHealthStatus, string> = {
  loading: 'bg-admin-text-muted/40',
  healthy: 'bg-emerald-500',
  attention: 'bg-amber-500',
  unknown: 'bg-admin-text-muted/40',
}

const STATUS_LABEL_KEY: Record<DashboardHealthStatus, string> = {
  loading: 'admin.dashboard.statusLoading',
  healthy: 'admin.dashboard.statusHealthy',
  attention: 'admin.dashboard.statusAttention',
  unknown: 'admin.dashboard.statusUnknown',
}

interface AdminDashboardHeaderProps {
  status: DashboardHealthStatus
  lastUpdated: Date | null
  onRefresh: () => void
  isRefreshing: boolean
}

/** Dashboard's own PageHeader-equivalent — same plain light title block, plus the
 *  live status dot / last-updated / refresh affordances PageHeader has no slot for. */
export function AdminDashboardHeader({
  status,
  lastUpdated,
  onRefresh,
  isRefreshing,
}: AdminDashboardHeaderProps) {
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-admin-text sm:text-3xl">
          {t('admin.dashboard.title')}
        </h1>
        <p className="mt-1 max-w-md text-sm text-admin-text-muted">{t('admin.dashboard.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div
          className="flex items-center gap-2 font-data text-xs uppercase tracking-wide text-admin-text-muted"
          aria-live="polite"
        >
          <span
            className={cn('inline-block size-1.5 rounded-full', STATUS_DOT_CLASS[status])}
            aria-hidden="true"
          />
          {t(STATUS_LABEL_KEY[status])}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-data text-xs text-admin-text-muted/70">
            {lastUpdated
              ? `${t('admin.dashboard.lastUpdated')} ${formatDateTime(lastUpdated.toISOString(), locale)}`
              : '—'}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-text-muted transition-colors hover:bg-black/[0.03] focus-ring disabled:opacity-50"
          >
            <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} aria-hidden="true" />
            {t('admin.dashboard.refresh')}
          </button>
        </div>
      </div>
    </div>
  )
}
