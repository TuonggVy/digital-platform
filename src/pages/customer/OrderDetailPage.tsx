import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileDown } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order, PaymentStatus } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

const paymentStatusVariant: Record<PaymentStatus, 'warning' | 'success' | 'neutral'> = {
  UNPAID: 'warning',
  PAID: 'success',
  REFUNDED: 'neutral',
}

export function OrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>()
  const { t } = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()
  const showToast = useUiStore((s) => s.showToast)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!orderCode) return
    setIsLoading(true)
    orderService.getOrderByCode(orderCode).then((o) => {
      if (!o) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      setOrder(o)
      setIsLoading(false)
    })
  }, [orderCode])

  useEffect(() => {
    if (notFound) navigate(ROUTES.ACCOUNT_ORDERS)
  }, [notFound, navigate])

  if (isLoading) return <LoadingSpinner className="py-32" label={t('common.loading')} />
  if (!order) return null

  function handleDownloadInvoice() {
    showToast(t('account.orderDetail.invoiceDemo'), 'info')
  }

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${t('account.orderDetail.title')} - ${order.orderCode}`} />

      <Breadcrumb
        items={[
          { label: t('account.orders.title'), href: ROUTES.ACCOUNT_ORDERS },
          { label: order.orderCode },
        ]}
      />

      <RevealOnScroll>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
              {order.orderCode}
            </h1>
            <p className="text-sm text-text-secondary">{formatDate(order.createdAt, locale)}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.orderStatus} />
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FileDown className="size-4" />}
              onClick={handleDownloadInvoice}
            >
              {t('account.orderDetail.downloadInvoice')}
            </Button>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('account.orderDetail.timeline')}
          </h2>
          <div className="flex flex-col gap-4">
            {order.statusHistory.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="mt-1 flex size-2.5 shrink-0 rounded-full bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={entry.status} />
                  <span className="text-xs text-text-secondary">
                    {formatDateTime(entry.timestamp, locale)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('account.orderDetail.items')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
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
                {order.items.map((item) => (
                  <tr key={item.cartItemId}>
                    <td className="py-3 pr-3 font-medium text-text-primary">{item.productName}</td>
                    <td className="py-3 pr-3 text-text-secondary">{item.packageName}</td>
                    <td className="py-3 pr-3 text-text-secondary">{item.quantity}</td>
                    <td className="py-3 pr-3 text-text-secondary">
                      {formatCurrency(item.unitPrice, locale)}
                    </td>
                    <td className="py-3 pl-3 text-right font-medium text-text-primary">
                      {formatCurrency(item.lineTotal, locale)}
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
            {order.discount > 0 && (
              <div className="flex w-full max-w-xs justify-between text-text-secondary sm:w-64">
                <span>{t('cart.discount')}</span>
                <span>-{formatCurrency(order.discount, locale)}</span>
              </div>
            )}
            <div className="flex w-full max-w-xs justify-between text-base font-semibold text-text-primary sm:w-64">
              <span>{t('cart.total')}</span>
              <span>{formatCurrency(order.total, locale)}</span>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevealOnScroll>
          <div className="h-full rounded-2xl border border-border p-5">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              {t('account.orderDetail.customerInfo')}
            </h2>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-secondary">{t('checkout.customerInfo.fullName')}</dt>
                <dd className="text-right font-medium text-text-primary">
                  {order.customerInfo.fullName}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-secondary">{t('checkout.customerInfo.email')}</dt>
                <dd className="text-right font-medium text-text-primary">
                  {order.customerInfo.email}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-secondary">{t('checkout.customerInfo.phone')}</dt>
                <dd className="text-right font-medium text-text-primary">
                  {order.customerInfo.phone}
                </dd>
              </div>
              {order.customerInfo.company && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-secondary">{t('checkout.customerInfo.company')}</dt>
                  <dd className="text-right font-medium text-text-primary">
                    {order.customerInfo.company}
                  </dd>
                </div>
              )}
              {order.customerInfo.taxCode && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-secondary">{t('checkout.customerInfo.taxCode')}</dt>
                  <dd className="text-right font-medium text-text-primary">
                    {order.customerInfo.taxCode}
                  </dd>
                </div>
              )}
              {order.customerInfo.note && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-secondary">{t('checkout.customerInfo.note')}</dt>
                  <dd className="text-right font-medium text-text-primary">
                    {order.customerInfo.note}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.05}>
          <div className="h-full rounded-2xl border border-border p-5">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              {t('account.orderDetail.paymentInfo')}
            </h2>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-secondary">{t('checkout.paymentMethod.title')}</dt>
                <dd className="font-medium text-text-primary">
                  {t(`checkout.paymentMethod.${order.paymentMethod}`)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-secondary">{t('common.status')}</dt>
                <dd>
                  <Badge variant={paymentStatusVariant[order.paymentStatus]}>
                    {t(`status.payment.${order.paymentStatus}`)}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
