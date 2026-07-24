import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Cloud, ShieldCheck, Smartphone } from 'lucide-react'
import { serviceService } from '@/services/serviceService'
import type { CloudService, CustomerService, EsimService, KasperskyService, ServiceStatus } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { AdminToolbar } from '@/components/admin/AdminToolbar'
import { AdminMobileList } from '@/components/admin/AdminMobileList'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { Tabs } from '@/components/common/Tabs'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ServiceStatusBadge } from '@/components/common/ServiceStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatDate } from '@/utils/formatters'

type ServiceType = 'cloud' | 'kaspersky' | 'esim'
type ServiceSort = 'expiry_asc' | 'expiry_desc'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400
const STATUS_OPTIONS: ServiceStatus[] = [
  'PENDING_ACTIVATION',
  'ACTIVE',
  'EXPIRING_SOON',
  'SUSPENDED',
  'EXPIRED',
]

export function AdminServicesPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [services, setServices] = useState<CustomerService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ServiceType>('cloud')

  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [status, setStatus] = useState<ServiceStatus | ''>('')
  const [sort, setSort] = useState<ServiceSort>('expiry_asc')
  const [page, setPage] = useState(1)

  function loadServices() {
    setIsLoading(true)
    setError(null)
    serviceService
      .getAllForAdmin()
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : t('toast.genericError')))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, status, sort, activeTab])

  const servicesForType = useMemo(
    () => services.filter((s) => s.type === activeTab),
    [services, activeTab],
  )

  const filtered = useMemo(() => {
    const rows = servicesForType.filter((s) => {
      if (status && s.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        const matches =
          s.orderCode.toLowerCase().includes(q) ||
          s.productName.toLowerCase().includes(q) ||
          s.packageName.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
    return [...rows].sort((a, b) => {
      const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      return sort === 'expiry_asc' ? diff : -diff
    })
  }, [servicesForType, search, status, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = search !== '' || status !== ''
  function clearFilters() {
    setSearchInput('')
    setStatus('')
  }

  const emptyTitle =
    servicesForType.length === 0 ? t('admin.services.noServices') : t('common.noResults')

  const orderPackageColumn = {
    key: 'orderPackage',
    header: t('admin.services.orderCode'),
    render: (s: CustomerService) => (
      <div className="flex flex-col">
        <span className="font-medium font-data">{s.orderCode}</span>
        <span className="text-xs text-text-secondary">
          {s.productName} &middot; {s.packageName}
        </span>
      </div>
    ),
  }
  const expiryColumn = {
    key: 'expiry',
    header: t('admin.services.expiryDate'),
    render: (s: CustomerService) => (
      <span className="font-data">{formatDate(s.expiryDate, locale)}</span>
    ),
  }
  const statusColumn = {
    key: 'status',
    header: t('admin.products.status'),
    render: (s: CustomerService) => <ServiceStatusBadge status={s.status} />,
  }

  return (
    <div>
      <Seo title={t('admin.services.title')} />
      <PageHeader title={t('admin.services.title')} description={t('admin.services.description')} />

      <div className="mb-5">
        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as ServiceType)}
          tabs={[
            {
              value: 'cloud',
              label: t('nav.megamenu.cloud'),
              icon: <Cloud className="size-3.5" />,
            },
            {
              value: 'kaspersky',
              label: t('nav.megamenu.kaspersky'),
              icon: <ShieldCheck className="size-3.5" />,
            },
            {
              value: 'esim',
              label: t('nav.megamenu.esim'),
              icon: <Smartphone className="size-3.5" />,
            },
          ]}
        />
      </div>

      <AdminToolbar
        resultText={t('admin.services.resultsCount', { count: filtered.length })}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        clearLabel={t('common.clearFilter')}
      >
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.services.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ServiceStatus | '')}
          placeholder={t('common.all')}
          className="sm:w-56"
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: t(`status.service.${s}`) }))}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as ServiceSort)}
          className="sm:w-56"
          options={[
            { value: 'expiry_asc', label: t('admin.services.sortExpiryAsc') },
            { value: 'expiry_desc', label: t('admin.services.sortExpiryDesc') },
          ]}
        />
      </AdminToolbar>

      {error ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title={t('common.error')}
          description={error}
          action={
            <button
              type="button"
              onClick={loadServices}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
            >
              {t('common.tryAgain')}
            </button>
          }
        />
      ) : (
        <>
          <div className="hidden sm:block">
            {activeTab === 'cloud' && (
              <DataTable
                data={pageItems as CloudService[]}
                isLoading={isLoading}
                rowKey={(s) => s.id}
                emptyTitle={emptyTitle}
                columns={[
                  orderPackageColumn,
                  {
                    key: 'specs',
                    header: t('admin.services.specs'),
                    render: (s: CloudService) => (
                      <div className="flex flex-col">
                        <span className="font-data text-xs">{s.ip}</span>
                        <span className="text-xs text-text-secondary">
                          {s.cpu} &middot; {s.ram} &middot; {s.ssd}
                        </span>
                      </div>
                    ),
                  },
                  { key: 'region', header: t('admin.services.region'), render: (s: CloudService) => s.region },
                  expiryColumn,
                  statusColumn,
                ]}
              />
            )}
            {activeTab === 'kaspersky' && (
              <DataTable
                data={pageItems as KasperskyService[]}
                isLoading={isLoading}
                rowKey={(s) => s.id}
                emptyTitle={emptyTitle}
                columns={[
                  orderPackageColumn,
                  {
                    key: 'licenseKey',
                    header: t('admin.services.licenseKey'),
                    render: (s: KasperskyService) => (
                      <span className="font-mono text-xs">{s.licenseKey}</span>
                    ),
                  },
                  { key: 'devices', header: t('admin.services.devices'), render: (s: KasperskyService) => s.devices },
                  expiryColumn,
                  statusColumn,
                ]}
              />
            )}
            {activeTab === 'esim' && (
              <DataTable
                data={pageItems as EsimService[]}
                isLoading={isLoading}
                rowKey={(s) => s.id}
                emptyTitle={emptyTitle}
                columns={[
                  orderPackageColumn,
                  { key: 'country', header: t('admin.services.country'), render: (s: EsimService) => s.country },
                  {
                    key: 'dataAmount',
                    header: t('admin.services.dataAmount'),
                    render: (s: EsimService) => (
                      <span>
                        {s.dataAmount} &middot; {s.days} {t('admin.services.daysUnit')}
                      </span>
                    ),
                  },
                  expiryColumn,
                  statusColumn,
                ]}
              />
            )}
          </div>

          <div className="sm:hidden">
            <AdminMobileList
              data={pageItems}
              isLoading={isLoading}
              rowKey={(s) => s.id}
              emptyTitle={emptyTitle}
              renderCard={(s) => (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium font-data">{s.orderCode}</p>
                      <p className="text-xs text-text-secondary">
                        {s.productName} &middot; {s.packageName}
                      </p>
                    </div>
                    <ServiceStatusBadge status={s.status} />
                  </div>
                  {s.type === 'cloud' && (
                    <p className="text-xs text-text-secondary">
                      {s.ip} &middot; {s.cpu}/{s.ram}/{s.ssd} &middot; {s.region}
                    </p>
                  )}
                  {s.type === 'kaspersky' && (
                    <p className="font-mono text-xs text-text-secondary">{s.licenseKey}</p>
                  )}
                  {s.type === 'esim' && (
                    <p className="text-xs text-text-secondary">
                      {s.country} &middot; {s.dataAmount} &middot; {s.days} {t('admin.services.daysUnit')}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary">
                    {t('admin.services.expiryDate')}: {formatDate(s.expiryDate, locale)}
                  </p>
                </div>
              )}
            />
          </div>

          {!isLoading && filtered.length > 0 && (
            <div className="mt-5">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
