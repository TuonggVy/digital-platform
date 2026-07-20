import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { orderApiService } from '@/services/orderApiService'
import type { BackendOrder } from '@/services/orderApiService'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Pagination } from '@/components/common/Pagination'
import { BackendOrderStatusBadge } from '@/components/common/BackendOrderStatusBadge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

const PAGE_SIZE = 10

/**
 * `GetMyOrdersDto` (backend) only supports `page`/`pageSize` — no status
 * filter/search for the customer-facing list (unlike the admin endpoint) —
 * so the old client-side status filter dropdown is dropped rather than
 * wired to a param the backend doesn't accept.
 */
export function OrdersPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [orders, setOrders] = useState<BackendOrder[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(
    async (pageToLoad: number) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await orderApiService.getMyOrders({ page: pageToLoad, pageSize: PAGE_SIZE })
        setOrders(result.items)
        setTotalPages(Math.max(1, result.totalPages))
      } catch (err) {
        setError(err instanceof Error ? err.message : t('toast.genericError'))
      } finally {
        setIsLoading(false)
      }
    },
    [t],
  )

  useEffect(() => {
    loadOrders(page)
  }, [page, loadOrders])

  return (
    <div className="flex flex-col gap-6">
      <Seo title={t('account.orders.title')} />

      <RevealOnScroll>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          {t('account.orders.title')}
        </h1>
      </RevealOnScroll>

      {isLoading ? (
        <LoadingSpinner className="py-24" label={t('common.loading')} />
      ) : error ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title={t('common.error')}
          description={error}
          action={<Button onClick={() => loadOrders(page)}>{t('common.tryAgain')}</Button>}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title={t('account.orders.empty')}
          action={
            <Link to={ROUTES.PRODUCTS}>
              <Button>{t('account.dashboard.browseProducts')}</Button>
            </Link>
          }
        />
      ) : (
        <>
          <StaggerContainer className="flex flex-col gap-4">
            {orders.map((order) => (
              <StaggerItem key={order.id}>
                <Link
                  to={ROUTES.ACCOUNT_ORDER_DETAIL(order.id)}
                  className="flex flex-col gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {order.orderCode}
                      </span>
                      <BackendOrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-text-secondary">
                      {formatDate(order.createdDate, locale)}
                    </p>
                  </div>
                  <span className="text-base font-semibold text-text-primary">
                    {formatCurrency(order.totalAmount, locale)}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
