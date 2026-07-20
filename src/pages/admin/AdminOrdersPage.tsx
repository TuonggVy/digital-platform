import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertCircle, Eye } from 'lucide-react'
import { orderApiService } from '@/services/orderApiService'
import type { BackendOrder, GetAdminOrdersParams, OrderStatus as BackendOrderStatus } from '@/services/orderApiService'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { BackendOrderStatusBadge } from '@/components/common/BackendOrderStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

const STATUS_OPTIONS: BackendOrderStatus[] = [
  'PENDING',
  'AWAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
]

export function AdminOrdersPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [orders, setOrders] = useState<BackendOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BackendOrderStatus | ''>('')
  const [sort, setSort] = useState<GetAdminOrdersParams['sort']>('newest')

  // Debounce the search box — reset to page 1 once the debounced value actually changes.
  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [search, status, sort])

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await orderApiService.getAdminOrders({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: status || undefined,
        sort,
      })
      setOrders(result.items)
      setTotal(result.total)
      setTotalPages(Math.max(1, result.totalPages))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status, sort, t])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  return (
    <div>
      <Seo title={t('admin.orders.title')} />
      <PageHeader title={t('admin.orders.title')} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.orders.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as BackendOrderStatus | '')}
          placeholder={t('common.all')}
          className="sm:w-56"
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: t(`status.backendOrder.${s}`) }))}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as GetAdminOrdersParams['sort'])}
          className="sm:w-56"
          options={[
            { value: 'newest', label: t('admin.orders.sortNewest') },
            { value: 'oldest', label: t('admin.orders.sortOldest') },
            { value: 'total_asc', label: t('admin.orders.sortTotalAsc') },
            { value: 'total_desc', label: t('admin.orders.sortTotalDesc') },
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
              onClick={loadOrders}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              {t('common.tryAgain')}
            </button>
          }
        />
      ) : (
        <>
          <DataTable
            data={orders}
            isLoading={isLoading}
            rowKey={(o) => o.id}
            emptyTitle={t('admin.orders.noOrders')}
            columns={[
              { key: 'code', header: t('admin.orders.orderCode'), render: (o) => o.orderCode },
              {
                key: 'customer',
                header: t('admin.orders.customer'),
                render: (o) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{o.customerName}</span>
                    <span className="text-xs text-text-secondary">{o.customerEmail}</span>
                  </div>
                ),
              },
              {
                key: 'date',
                header: t('admin.orders.date'),
                render: (o) => formatDateTime(o.createdDate, locale),
              },
              {
                key: 'total',
                header: t('admin.orders.total'),
                render: (o) => formatCurrency(o.totalAmount, locale),
              },
              {
                key: 'status',
                header: t('admin.orders.status'),
                render: (o) => <BackendOrderStatusBadge status={o.status} />,
              },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (o) => (
                  <Link
                    to={ROUTES.ADMIN_ORDER_DETAIL(o.id)}
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
