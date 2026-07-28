import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { EsimService } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { AdminMobileList } from '@/components/admin/AdminMobileList'
import { Pagination } from '@/components/common/Pagination'
import { EsimServicesTable } from '@/components/admin/services/EsimServicesTable'
import { ServiceMobileCard } from '@/components/admin/services/ServiceMobileCard'
import { ServiceFilterBar } from '@/components/admin/services/ServiceFilterBar'
import { ServiceLoadError } from '@/components/admin/services/ServiceLoadError'
import { useAdminServices } from '@/hooks/useAdminServices'
import { useServiceFilters } from '@/hooks/useServiceFilters'

export function AdminEsimServicesPage() {
  const { t } = useTranslation()
  const { services, isLoading, error, reload } = useAdminServices()

  const esimServices = useMemo(
    () => services.filter((s): s is EsimService => s.type === 'esim'),
    [services],
  )

  const {
    searchInput,
    setSearchInput,
    status,
    setStatus,
    sort,
    setSort,
    page,
    setPage,
    filtered,
    pageItems,
    totalPages,
    hasActiveFilters,
    clearFilters,
  } = useServiceFilters(esimServices)

  const emptyTitle =
    esimServices.length === 0 ? t('admin.services.noServices') : t('common.noResults')

  return (
    <div>
      <Seo title={t('admin.esims.title')} />
      <PageHeader title={t('admin.esims.title')} description={t('admin.services.esimDescription')} />

      <ServiceFilterBar
        resultCount={filtered.length}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ServiceLoadError error={error} onRetry={reload} />
      ) : (
        <>
          <div className="hidden sm:block">
            <EsimServicesTable data={pageItems} isLoading={isLoading} emptyTitle={emptyTitle} />
          </div>

          <div className="sm:hidden">
            <AdminMobileList
              data={pageItems}
              isLoading={isLoading}
              rowKey={(s) => s.id}
              emptyTitle={emptyTitle}
              renderCard={(s) => <ServiceMobileCard service={s} />}
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
