import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'
import { orderApiService } from '@/services/orderApiService'
import type { BackendOrder } from '@/services/orderApiService'
import {
  paymentApiService,
  TERMINAL_PAYMENT_STATUSES,
  type BackendPayment,
  type PaymentMethod,
} from '@/services/paymentApiService'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { RadioGroup } from '@/components/common/RadioGroup'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { PaymentStatusBadge } from '@/components/common/PaymentStatusBadge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

export function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocale()
  const { orderId } = useParams<{ orderId: string }>()
  const currentUser = useAuthStore((s) => s.currentUser)

  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [payments, setPayments] = useState<BackendPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [method, setMethod] = useState<PaymentMethod>('SANDBOX')
  const [isCreating, setIsCreating] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async (id: string) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [orderResult, paymentsResult] = await Promise.all([
        orderApiService.getOrderDetail(id),
        paymentApiService.getPaymentsForOrder(id),
      ])
      setOrder(orderResult)
      setPayments(paymentsResult)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN, { state: { from: orderId ? ROUTES.CHECKOUT_PAYMENT(orderId) : ROUTES.HOME }, replace: true })
      return
    }
    if (!orderId) return
    load(orderId)
  }, [currentUser, orderId, navigate, load])

  if (!orderId || !currentUser) {
    return null
  }

  if (isLoading) {
    return <LoadingSpinner className="py-32" label={t('common.loading')} />
  }

  if (loadError || !order) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title={t('payment.notFound')}
        description={loadError ?? undefined}
        action={
          <Link to={ROUTES.ACCOUNT_ORDERS}>
            <Button variant="outline">{t('account.orders.title')}</Button>
          </Link>
        }
      />
    )
  }

  const latestPayment = payments[0] ?? null
  const isActionable = latestPayment ? !TERMINAL_PAYMENT_STATUSES.includes(latestPayment.status) : false
  const orderAlreadySettled = !['PENDING', 'AWAITING_PAYMENT'].includes(order.status)

  async function handleCreatePayment() {
    if (isCreating || !order) return
    setIsCreating(true)
    setActionError(null)
    try {
      await paymentApiService.createPayment({ orderId: order.id, method })
      await load(order.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleSandbox(result: 'SUCCESS' | 'FAILURE' | 'CANCEL') {
    if (isCompleting || !latestPayment || !order) return
    setIsCompleting(true)
    setActionError(null)
    try {
      const updated = await paymentApiService.sandboxComplete(latestPayment.id, result)
      if (updated.status === 'SUCCEEDED') {
        navigate(ROUTES.ACCOUNT_ORDER_DETAIL(order.id), { replace: true })
        return
      }
      await load(order.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsCompleting(false)
    }
  }

  const methodOptions = [
    { value: 'SANDBOX', label: t('payment.method.sandbox') },
    { value: 'BANK_TRANSFER', label: t('payment.method.bankTransfer') },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('payment.title')} />

      <RevealOnScroll direction="none">
        <div className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-text-primary">{t('payment.title')}</h1>

          <div className="mt-6 rounded-xl border border-border bg-background p-5 text-sm">
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('checkout.success.orderCode')}</span>
              <span className="font-semibold text-text-primary">{order.orderCode}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-text-secondary">{t('payment.amount')}</span>
              <span className="font-semibold text-primary">
                {formatCurrency(order.totalAmount, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text-secondary">{t('payment.currency')}</span>
              <span className="text-text-primary">{order.currency}</span>
            </div>
          </div>

          {orderAlreadySettled ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-text-secondary">
              {t('payment.orderSettled')}
            </div>
          ) : !latestPayment || !isActionable ? (
            <div className="mt-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-text-primary">{t('payment.chooseMethod')}</h2>
              <RadioGroup
                name="paymentMethod"
                value={method}
                onChange={(value) => setMethod(value as PaymentMethod)}
                options={methodOptions}
              />
              {latestPayment && (
                <p className="rounded-xl border border-dashed border-red-400/40 bg-red-500/5 p-3 text-xs text-red-600">
                  {t('payment.retryNotice')}
                </p>
              )}
              {actionError && <p className="text-sm text-red-500">{actionError}</p>}
              <Button size="lg" isLoading={isCreating} onClick={handleCreatePayment} className="w-full">
                {latestPayment ? t('payment.retry') : t('payment.createPayment')}
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-4 text-sm">
                <div>
                  <p className="font-medium text-text-primary">{latestPayment.paymentCode}</p>
                  <p className="text-xs text-text-secondary">
                    {t(`payment.method.${latestPayment.method === 'SANDBOX' ? 'sandbox' : 'bankTransfer'}`)}
                  </p>
                </div>
                <PaymentStatusBadge status={latestPayment.status} />
              </div>

              <p className="rounded-xl border border-dashed border-border bg-surface/40 p-4 text-sm text-text-secondary">
                {t('payment.sandboxInstructions')}
              </p>

              {actionError && <p className="text-sm text-red-500">{actionError}</p>}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  isLoading={isCompleting}
                  onClick={() => handleSandbox('SUCCESS')}
                  className="flex-1"
                >
                  {t('payment.sandboxSuccess')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={isCompleting}
                  onClick={() => handleSandbox('FAILURE')}
                  className="flex-1"
                >
                  {t('payment.sandboxFailure')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={isCompleting}
                  onClick={() => handleSandbox('CANCEL')}
                  className="flex-1"
                >
                  {t('payment.sandboxCancel')}
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link
              to={ROUTES.ACCOUNT_ORDER_DETAIL(order.id)}
              className="font-medium text-primary hover:underline"
            >
              {t('payment.viewOrder')}
            </Link>
          </p>
        </div>
      </RevealOnScroll>
    </div>
  )
}
