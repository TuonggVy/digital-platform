import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useLocale } from '@/hooks/useLocale'
import { formatDateTime } from '@/utils/formatters'

export type DashboardHealthStatus = 'loading' | 'healthy' | 'attention' | 'unknown'

const STATUS_DOT_CLASS: Record<DashboardHealthStatus, string> = {
  loading: 'bg-white/40',
  healthy: 'bg-home-wire',
  attention: 'bg-amber-400',
  unknown: 'bg-white/40',
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

/** Compact operational status band — echoes the same dark home-ink + font-data
 *  "status readout" language already used by the public homepage's service panels,
 *  applied here as a slim header rather than a marketing hero. */
export function AdminDashboardHeader({
  status,
  lastUpdated,
  onRefresh,
  isRefreshing,
}: AdminDashboardHeaderProps) {
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <div className="rounded-2xl border border-home-line/15 bg-home-ink px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-white sm:text-2xl">
            {t('admin.dashboard.title')}
          </h1>
          <p className="mt-1 max-w-md text-sm text-white/60">{t('admin.dashboard.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2 font-data text-xs uppercase tracking-wide text-white/70">
            <span
              className={cn('inline-block size-1.5 rounded-full', STATUS_DOT_CLASS[status])}
              aria-hidden="true"
            />
            {t(STATUS_LABEL_KEY[status])}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-data text-xs text-white/45">
              {lastUpdated
                ? `${t('admin.dashboard.lastUpdated')} ${formatDateTime(lastUpdated.toISOString(), locale)}`
                : '—'}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/5 focus-ring disabled:opacity-50"
            >
              <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} aria-hidden="true" />
              {t('admin.dashboard.refresh')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
