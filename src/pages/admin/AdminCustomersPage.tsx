import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertCircle, Eye } from 'lucide-react'
import { customerApiService } from '@/services/customerApiService'
import type {
  AdminCustomer,
  CustomerStatus,
  GetAdminCustomersParams,
} from '@/services/customerApiService'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/common/Badge'
import { useLocale } from '@/hooks/useLocale'
import { formatDateTime } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

export function AdminCustomersPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CustomerStatus | ''>('')
  const [sort, setSort] = useState<GetAdminCustomersParams['sort']>('newest')

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [search, status, sort])

  const loadCustomers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await customerApiService.getAdminCustomers({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: status || undefined,
        sort,
      })
      setCustomers(result.items)
      setTotal(result.total)
      setTotalPages(Math.max(1, result.totalPages))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status, sort, t])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  return (
    <div>
      <Seo title={t('admin.customers.title')} />
      <PageHeader title={t('admin.customers.title')} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.customers.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as CustomerStatus | '')}
          placeholder={t('common.all')}
          className="sm:w-56"
          options={[
            { value: 'ACTIVE', label: t('admin.customers.statusActive') },
            { value: 'INACTIVE', label: t('admin.customers.statusInactive') },
          ]}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as GetAdminCustomersParams['sort'])}
          className="sm:w-56"
          options={[
            { value: 'newest', label: t('admin.customers.sortNewest') },
            { value: 'oldest', label: t('admin.customers.sortOldest') },
            { value: 'name_asc', label: t('admin.customers.sortNameAsc') },
            { value: 'name_desc', label: t('admin.customers.sortNameDesc') },
          ]}
        />
      </div>

      {error ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title={t('common.error')}
          description={error}
          action={
            <button
              type="button"
              onClick={loadCustomers}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              {t('common.tryAgain')}
            </button>
          }
        />
      ) : (
        <>
          <DataTable
            data={customers}
            isLoading={isLoading}
            rowKey={(c) => c.id}
            emptyTitle={t('admin.customers.noCustomers')}
            columns={[
              { key: 'name', header: t('admin.customers.name'), render: (c) => c.fullName },
              { key: 'email', header: t('admin.customers.email'), render: (c) => c.email },
              { key: 'phone', header: t('admin.customers.phone'), render: (c) => c.phone ?? '-' },
              {
                key: 'joinedDate',
                header: t('admin.customers.joinedDate'),
                render: (c) => formatDateTime(c.createdDate, locale),
              },
              {
                key: 'status',
                header: t('admin.customers.status'),
                render: (c) => (
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {t(`admin.customers.status${c.status === 'ACTIVE' ? 'Active' : 'Inactive'}`)}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (c) => (
                  <Link
                    to={ROUTES.ADMIN_CUSTOMER_DETAIL(c.id)}
                    aria-label={t('admin.orders.details')}
                    title={t('admin.orders.details')}
                    className="inline-flex rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text-primary"
                  >
                    <Eye className="size-4" />
                  </Link>
                ),
              },
            ]}
          />

          {!isLoading && total > 0 && (
            <div className="mt-5">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
