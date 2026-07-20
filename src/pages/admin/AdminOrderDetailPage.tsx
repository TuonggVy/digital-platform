import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { orderApiService } from '@/services/orderApiService'
import type { BackendOrder, OrderStatus as BackendOrderStatus } from '@/services/orderApiService'
import { Seo } from '@/components/common/Seo'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { BackendOrderStatusBadge } from '@/components/common/BackendOrderStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { useUiStore } from '@/stores/uiStore'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { localize } from '@/utils/localize'
import { ROUTES } from '@/constants/routes'

/**
 * Mirrors backend `ALLOWED_STATUS_TRANSITIONS` (orders.service.ts) — used only
 * to narrow the dropdown for UX. The backend remains the final validator; any
 * mismatch surfaces as a 400 from `updateOrderStatus` and is shown as-is.
 */
const ALLOWED_STATUS_TRANSITIONS: Record<BackendOrderStatus, BackendOrderStatus[]> = {
  PENDING: ['AWAITING_PAYMENT', 'CANCELLED', 'FAILED'],
  AWAITING_PAYMENT: ['PAID', 'CANCELLED', 'FAILED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  PROCESSING: ['COMPLETED', 'REFUNDED', 'FAILED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  FAILED: ['AWAITING_PAYMENT'],
  REFUNDED: [],
}

export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { t } = useTranslation()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)

  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pendingStatus, setPendingStatus] = useState<BackendOrderStatus | ''>('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadOrder = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await orderApiService.getAdminOrderDetail(id)
        setOrder(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('toast.genericError'))
      } finally {
        setIsLoading(false)
      }
    },
    [t],
  )

  useEffect(() => {
    if (!orderId) return
    loadOrder(orderId)
  }, [orderId, loadOrder])

  async function handleConfirmStatusChange() {
    if (!order || !pendingStatus || isUpdating) return
    setIsConfirmOpen(false)
    setIsUpdating(true)
    try {
      const updated = await orderApiService.updateOrderStatus(order.id, pendingStatus)
      setOrder(updated)
      showToast(t('admin.orders.statusUpdated'), 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toast.genericError')
      showToast(message, 'error')
    } finally {
      setIsUpdating(false)
      setPendingStatus('')
    }
  }

  if (!orderId) return null

  if (isLoading) {
    return <LoadingSpinner className="py-32" label={t('common.loading')} />
  }

  if (error || !order) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title={t('account.orderDetail.notFound')}
        description={error ?? undefined}
        action={
          <Link to={ROUTES.ADMIN_ORDERS}>
            <Button variant="outline">{t('admin.orders.title')}</Button>
          </Link>
        }
      />
    )
  }

  const nextStatusOptions = ALLOWED_STATUS_TRANSITIONS[order.status] ?? []

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${t('account.orderDetail.title')} - ${order.orderCode}`} />

      <Breadcrumb
        items={[
          { label: t('admin.orders.title'), href: ROUTES.ADMIN_ORDERS },
          { label: order.orderCode },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            {order.orderCode}
          </h1>
          <p className="text-xs text-text-secondary">
            {t('admin.orders.systemId')}: {order.id}
          </p>
          <p className="text-sm text-text-secondary">{formatDateTime(order.createdDate, locale)}</p>
        </div>
        <BackendOrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          {t('admin.orders.updateStatus')}
        </h2>
        {nextStatusOptions.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('admin.orders.noValidNextStatus')}</p>
        ) : (
          <div className="flex flex-col gap-3 sm:max-w-sm">
            <Select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value as BackendOrderStatus | '')}
              placeholder={t('admin.orders.newStatus')}
              disabled={isUpdating}
              options={nextStatusOptions.map((s) => ({
                value: s,
                label: t(`status.backendOrder.${s}`),
              }))}
            />
            <Button
              disabled={!pendingStatus || isUpdating}
              isLoading={isUpdating}
              onClick={() => setIsConfirmOpen(true)}
              className="self-start"
            >
              {t('admin.orders.updateStatus')}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">{t('admin.orders.items')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="py-2 pr-3 font-medium">{t('account.orders.products')}</th>
                <th className="py-2 pr-3 font-medium">{t('cart.package')}</th>
                <th className="py-2 pr-3 font-medium">{t('common.quantity')}</th>
                <th className="py-2 pr-3 font-medium">{t('productDetail.totalPrice')}</th>
                <th className="py-2 pl-3 text-right font-medium">{t('account.orders.total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(order.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-3 font-medium text-text-primary">
                    {localize(item.productName, locale)}
                    <span className="block text-xs text-text-secondary">{item.productType}</span>
                  </td>
                  <td className="py-3 pr-3 text-text-secondary">
                    {item.packageName ? localize(item.packageName, locale) : '-'}
                  </td>
                  <td className="py-3 pr-3 text-text-secondary">{item.quantity}</td>
                  <td className="py-3 pr-3 text-text-secondary">
                    {formatCurrency(item.unitPrice, locale)}
                  </td>
                  <td className="py-3 pl-3 text-right font-medium text-text-primary">
                    {formatCurrency(item.totalPrice, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-end gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex w-full max-w-xs justify-between text-text-secondary sm:w-64">
            <span>{t('cart.subtotal')}</span>
            <span>{formatCurrency(order.subtotal, locale)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex w-full max-w-xs justify-between text-text-secondary sm:w-64">
              <span>{t('cart.discount')}</span>
              <span>-{formatCurrency(order.discountAmount, locale)}</span>
            </div>
          )}
          {order.taxAmount > 0 && (
            <div className="flex w-full max-w-xs justify-between text-text-secondary sm:w-64">
              <span>{t('account.orderDetail.tax')}</span>
              <span>{formatCurrency(order.taxAmount, locale)}</span>
            </div>
          )}
          <div className="flex w-full max-w-xs justify-between text-base font-semibold text-text-primary sm:w-64">
            <span>{t('cart.total')}</span>
            <span>{formatCurrency(order.totalAmount, locale)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          {t('admin.orders.customerInfo')}
        </h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('checkout.customerInfo.fullName')}</dt>
            <dd className="text-right font-medium text-text-primary">{order.customerName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('checkout.customerInfo.email')}</dt>
            <dd className="text-right font-medium text-text-primary">{order.customerEmail}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('checkout.customerInfo.phone')}</dt>
            <dd className="text-right font-medium text-text-primary">{order.customerPhone}</dd>
          </div>
          {order.note && (
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t('checkout.customerInfo.note')}</dt>
              <dd className="text-right font-medium text-text-primary">{order.note}</dd>
            </div>
          )}
          {order.modifiedDate && (
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t('admin.orders.modifiedDate')}</dt>
              <dd className="text-right font-medium text-text-primary">
                {formatDateTime(order.modifiedDate, locale)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={t('admin.orders.confirmStatusChangeTitle')}
        description={
          pendingStatus
            ? t('admin.orders.confirmStatusChangeDescription', {
                code: order.orderCode,
                from: t(`status.backendOrder.${order.status}`),
                to: t(`status.backendOrder.${pendingStatus}`),
              })
            : undefined
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}
