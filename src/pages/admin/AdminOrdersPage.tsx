import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order, OrderStatus } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { Select } from '@/components/common/Select'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
]

export function AdminOrdersPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    orderService
      .getAllOrders()
      .then(setOrders)
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(
    () => (statusFilter ? orders.filter((o) => o.orderStatus === statusFilter) : orders),
    [orders, statusFilter],
  )

  async function handleStatusChange(order: Order, status: OrderStatus) {
    const updated = await orderService.updateOrderStatus(order.id, status)
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    showToast(t('admin.orders.statusUpdated'), 'success')
  }

  return (
    <div>
      <Seo title={t('admin.orders.title')} />
      <PageHeader title={t('admin.orders.title')} />

      <div className="mb-5">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          options={ORDER_STATUSES.map((s) => ({ value: s, label: t(`status.order.${s}`) }))}
          placeholder={t('common.all')}
          className="sm:w-56"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('admin.orders.noOrders')} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id
            return (
              <div key={order.id} className="rounded-2xl border border-border">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="grid w-full grid-cols-1 gap-2 p-4 text-left sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-3"
                >
                  <div>
                    <p className="text-xs text-text-secondary sm:hidden">
                      {t('admin.orders.orderCode')}
                    </p>
                    <p className="font-medium text-text-primary">{order.orderCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary sm:hidden">
                      {t('admin.orders.customer')}
                    </p>
                    <p className="text-text-primary">{order.customerInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary sm:hidden">
                      {t('admin.orders.date')}
                    </p>
                    <p className="text-text-secondary">{formatDateTime(order.createdAt, locale)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary sm:hidden">
                      {t('admin.orders.total')}
                    </p>
                    <p className="font-medium text-text-primary">
                      {formatCurrency(order.total, locale)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <OrderStatusBadge status={order.orderStatus} />
                    <ChevronDown
                      className={cn(
                        'size-4 text-text-secondary transition-transform',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <div className="mb-4 flex flex-col gap-2 sm:max-w-xs">
                      <label className="text-sm font-medium text-text-primary">
                        {t('admin.orders.updateStatus')}
                      </label>
                      <Select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        options={ORDER_STATUSES.map((s) => ({
                          value: s,
                          label: t(`status.order.${s}`),
                        }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-text-primary">
                          {t('admin.orders.items')}
                        </h3>
                        <div className="flex flex-col gap-2">
                          {order.items.map((item) => (
                            <div
                              key={item.cartItemId}
                              className="flex items-center justify-between rounded-xl bg-surface/60 px-3 py-2 text-sm"
                            >
                              <div>
                                <p className="font-medium text-text-primary">{item.productName}</p>
                                <p className="text-xs text-text-secondary">
                                  {item.packageName} &times; {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium text-text-primary">
                                {formatCurrency(item.lineTotal, locale)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-text-primary">
                          {t('admin.orders.customerInfo')}
                        </h3>
                        <div className="rounded-xl bg-surface/60 px-3 py-2 text-sm text-text-secondary">
                          <p>
                            <span className="text-text-primary">{order.customerInfo.fullName}</span>
                          </p>
                          <p>{order.customerInfo.email}</p>
                          <p>{order.customerInfo.phone}</p>
                          {order.customerInfo.company && <p>{order.customerInfo.company}</p>}
                          <p className="mt-2">
                            {t('admin.orders.paymentMethod')}:{' '}
                            {t(`checkout.paymentMethod.${order.paymentMethod}`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
