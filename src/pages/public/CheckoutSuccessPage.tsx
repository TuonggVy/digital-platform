import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { orderApiService } from '@/services/orderApiService'
import type { BackendOrder } from '@/services/orderApiService'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { localize } from '@/utils/localize'
import { ROUTES } from '@/constants/routes'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { BackendOrderStatusBadge } from '@/components/common/BackendOrderStatusBadge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

interface CheckoutSuccessLocationState {
  order?: BackendOrder
}

export function CheckoutSuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const locale = useLocale()
  // Route path is still `/checkout/success/:orderCode` (unchanged) — the segment
  // now carries the backend Order's UUID `id`, needed by `getOrderDetail` on refresh.
  const { orderCode: orderId } = useParams<{ orderCode: string }>()

  const stateOrder = (location.state as CheckoutSuccessLocationState | null)?.order ?? null
  const [order, setOrder] = useState<BackendOrder | null>(stateOrder)
  const [isLoading, setIsLoading] = useState(!stateOrder)

  useEffect(() => {
    if (stateOrder) return
    if (!orderId) {
      navigate(ROUTES.HOME, { replace: true })
      return
    }

    let isActive = true
    orderApiService
      .getOrderDetail(orderId)
      .then((result) => {
        if (!isActive) return
        setOrder(result)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isActive) return
        navigate(ROUTES.HOME, { replace: true })
      })

    return () => {
      isActive = false
    }
    // Only re-run if the URL id changes — `stateOrder`/`navigate` are stable for this purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <LoadingSpinner label={t('common.loading')} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Seo title={t('checkout.success.title')} />

      <RevealOnScroll direction="none">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface/40 p-8 text-center sm:p-12">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-9" />
          </div>

          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            {t('checkout.success.title')}
          </h1>

          <BackendOrderStatusBadge status={order.status} />

          <div className="mt-4 w-full rounded-xl border border-border bg-background p-5 text-left text-sm">
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.success.orderCode')}</span>
              <span className="font-semibold text-text-primary">{order.orderCode}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.customerInfo.fullName')}</span>
              <span className="text-text-primary">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.customerInfo.email')}</span>
              <span className="text-text-primary">{order.customerEmail}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.customerInfo.phone')}</span>
              <span className="text-text-primary">{order.customerPhone}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('cart.subtotal')}</span>
              <span className="text-text-primary">{formatCurrency(order.subtotal, locale)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.success.total')}</span>
              <span className="font-semibold text-primary">
                {formatCurrency(order.totalAmount, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text-secondary">{t('checkout.success.createdAt')}</span>
              <span className="text-text-primary">{formatDateTime(order.createdDate, locale)}</span>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="w-full divide-y divide-border rounded-xl border border-border text-left text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-text-primary">
                      {localize(item.productName, locale)}
                    </p>
                    {item.packageName && (
                      <p className="text-xs text-text-secondary">
                        {localize(item.packageName, locale)}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary">×{item.quantity}</p>
                  </div>
                  <p className="whitespace-nowrap font-medium text-text-primary">
                    {formatCurrency(item.totalPrice, locale)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(ROUTES.ACCOUNT_ORDER_DETAIL(order.id))}
            >
              {t('checkout.success.viewOrder')}
            </Button>
            <Button className="flex-1" onClick={() => navigate(ROUTES.PRODUCTS)}>
              {t('checkout.success.continueShopping')}
            </Button>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  )
}
