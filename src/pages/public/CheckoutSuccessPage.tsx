import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useOrderStore } from '@/stores/orderStore'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'
import type { Order } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

export function CheckoutSuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocale()
  const { orderCode } = useParams<{ orderCode: string }>()
  const getOrderByCode = useOrderStore((s) => s.getOrderByCode)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!orderCode) {
      navigate(ROUTES.HOME, { replace: true })
      return
    }

    let isActive = true
    getOrderByCode(orderCode).then((result) => {
      if (!isActive) return
      if (!result) {
        navigate(ROUTES.HOME, { replace: true })
        return
      }
      setOrder(result)
      setIsLoading(false)
    })

    return () => {
      isActive = false
    }
  }, [orderCode, getOrderByCode, navigate])

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

          <OrderStatusBadge status={order.orderStatus} />

          <div className="mt-4 w-full rounded-xl border border-border bg-background p-5 text-left text-sm">
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.success.orderCode')}</span>
              <span className="font-semibold text-text-primary">{order.orderCode}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.success.total')}</span>
              <span className="font-semibold text-primary">
                {formatCurrency(order.total, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text-secondary">
                {t('checkout.success.paymentMethodLabel')}
              </span>
              <span className="font-medium text-text-primary">
                {t(`checkout.paymentMethod.${order.paymentMethod}`)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(ROUTES.ACCOUNT_ORDER_DETAIL(order.orderCode))}
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
