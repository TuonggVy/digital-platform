import { useTranslation } from 'react-i18next'
import { AdminToolbar } from '@/components/admin/AdminToolbar'
import { SearchBar } from '@/components/common/SearchBar'
import { AdminSelect, ALL_FILTER_VALUE } from '@/components/admin/AdminSelect'
import type { ServiceStatus } from '@/types'

const STATUS_OPTIONS: ServiceStatus[] = [
  'PENDING_ACTIVATION',
  'ACTIVE',
  'EXPIRING_SOON',
  'SUSPENDED',
  'EXPIRED',
]

export type ServiceSort = 'expiry_asc' | 'expiry_desc'

interface ServiceFilterBarProps {
  resultCount: number
  searchInput: string
  onSearchChange: (value: string) => void
  status: ServiceStatus | ''
  onStatusChange: (value: ServiceStatus | '') => void
  sort: ServiceSort
  onSortChange: (value: ServiceSort) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

/** Search + status filter + sort select, shared by the aggregate and Cloud-only services pages. */
export function ServiceFilterBar({
  resultCount,
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}: ServiceFilterBarProps) {
  const { t } = useTranslation()

  return (
    <AdminToolbar
      resultText={t('admin.services.resultsCount', { count: resultCount })}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
      clearLabel={t('common.clearFilter')}
    >
      <SearchBar
        value={searchInput}
        onChange={onSearchChange}
        placeholder={t('admin.services.searchPlaceholder')}
        className="sm:max-w-xs"
      />
      <AdminSelect
        variant="filter"
        value={status || ALL_FILTER_VALUE}
        onValueChange={(v) => onStatusChange(v === ALL_FILTER_VALUE ? '' : (v as ServiceStatus))}
        className="sm:w-56"
        options={[
          { value: ALL_FILTER_VALUE, label: t('common.all') },
          ...STATUS_OPTIONS.map((s) => ({ value: s, label: t(`status.service.${s}`) })),
        ]}
      />
      <AdminSelect
        variant="filter"
        value={sort}
        onValueChange={(v) => onSortChange(v as ServiceSort)}
        className="sm:w-56"
        options={[
          { value: 'expiry_asc', label: t('admin.services.sortExpiryAsc') },
          { value: 'expiry_desc', label: t('admin.services.sortExpiryDesc') },
        ]}
      />
    </AdminToolbar>
  )
}
