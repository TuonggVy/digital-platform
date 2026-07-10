import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { orderService } from '@/services/orderService'
import type { Order, OrderStatus } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
]

export function OrdersPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const currentUser = useAuthStore((s) => s.currentUser)

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  useEffect(() => {
    if (!currentUser) return
    setIsLoading(true)
    orderService.getOrdersByUser(currentUser.id).then((o) => {
      setOrders(o)
      setIsLoading(false)
    })
  }, [currentUser])

  const filteredOrders = useMemo(
    () => (statusFilter ? orders.filter((o) => o.orderStatus === statusFilter) : orders),
    [orders, statusFilter],
  )

  function productsSummary(order: Order): string {
    if (order.items.length === 0) return '-'
    const [first, ...rest] = order.items
    if (rest.length === 0) return first.productName
    return `${first.productName} và ${rest.length} sản phẩm khác`
  }

  return (
    <div className="flex flex-col gap-6">
      <Seo title={t('account.orders.title')} />

      <RevealOnScroll>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            {t('account.orders.title')}
          </h1>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            placeholder={t('common.all')}
            className="w-full sm:w-56"
            options={STATUS_OPTIONS.map((status) => ({
              value: status,
              label: t(`status.order.${status}`),
            }))}
          />
        </div>
      </RevealOnScroll>

      {isLoading ? (
        <LoadingSpinner className="py-24" label={t('common.loading')} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState title={t('account.orders.empty')} />
      ) : (
        <StaggerContainer className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <StaggerItem key={order.id}>
              <div className="flex flex-col gap-4 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {order.orderCode}
                    </span>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                  <p className="text-xs text-text-secondary">
                    {formatDate(order.createdAt, locale)}
                  </p>
                  <p className="text-sm text-text-secondary">{productsSummary(order)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                  <span className="text-base font-semibold text-text-primary">
                    {formatCurrency(order.total, locale)}
                  </span>
                  <Link to={ROUTES.ACCOUNT_ORDER_DETAIL(order.orderCode)}>
                    <Button size="sm" variant="outline">
                      {t('common.viewDetails')}
                    </Button>
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}
