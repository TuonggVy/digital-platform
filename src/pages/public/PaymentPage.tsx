import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Building2, FlaskConical, Wallet } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'
import { localize } from '@/utils/localize'
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
import { Input, Textarea } from '@/components/common/Input'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { PaymentStatusBadge } from '@/components/common/PaymentStatusBadge'
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout'
import { CheckoutReviewCard } from '@/components/checkout/CheckoutReviewCard'
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary'
import { CheckoutSecurityNotice } from '@/components/checkout/CheckoutSecurityNotice'
import { MobileOrderSummary } from '@/components/checkout/MobileOrderSummary'
import { PaymentMethodCard } from '@/components/checkout/PaymentMethodCard'

const methodDescriptionKey: Record<PaymentMethod, string> = {
  VNPAY: 'vnpay',
  BANK_TRANSFER: 'bankTransfer',
  SANDBOX: 'sandbox',
}

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

  // The order already exists by the time PaymentPage renders — there's no
  // "resubmit info" route to navigate back to, so "back to Information" is a
  // local, read-only view of what was submitted, not a real route change.
  const [viewStep, setViewStep] = useState<1 | 2>(2)

  // Defaults differ by environment on purpose: SANDBOX keeps today's working test
  // flow the default in dev (never break it), while VNPAY — the intended
  // production default once the backend supports it — leads in every other build.
  const [method, setMethod] = useState<PaymentMethod>(import.meta.env.DEV ? 'SANDBOX' : 'VNPAY')
  const [isCreating, setIsCreating] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | undefined>(undefined)

  const load = useCallback(
    async (id: string) => {
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
    },
    [t],
  )

  useEffect(() => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN, {
        state: { from: orderId ? ROUTES.CHECKOUT_PAYMENT(orderId) : ROUTES.HOME },
        replace: true,
      })
      return
    }
    if (!orderId) return
    load(orderId)
  }, [currentUser, orderId, navigate, load])

  if (!orderId || !currentUser) {
    return null
  }

  const backProps = { backTo: ROUTES.ACCOUNT_ORDERS, backLabel: t('checkout.layout.backToOrders') } as const

  if (isLoading) {
    return (
      <>
        <Seo title={t('payment.title')} />
        <CheckoutLayout {...backProps} currentStep={2} left={<LoadingSpinner label={t('common.loading')} />}>
          <LoadingSpinner className="py-16" label={t('common.loading')} />
        </CheckoutLayout>
      </>
    )
  }

  if (loadError || !order) {
    return (
      <>
        <Seo title={t('payment.title')} />
        <CheckoutLayout {...backProps} currentStep={2} left={null}>
          <EmptyState
            icon={<AlertCircle className="size-6" />}
            title={t('payment.notFound')}
            description={loadError ?? undefined}
            action={
              <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNT_ORDERS)}>
                {t('account.orders.title')}
              </Button>
            }
          />
        </CheckoutLayout>
      </>
    )
  }

  const latestPayment = payments[0] ?? null
  const hasSucceededPayment = payments.some((p) => p.status === 'SUCCEEDED')
  const isActionable = latestPayment ? !TERMINAL_PAYMENT_STATUSES.includes(latestPayment.status) : false
  const orderAlreadySettled = !['PENDING', 'AWAITING_PAYMENT'].includes(order.status)
  // Explicit on top of `orderAlreadySettled`: a SUCCEEDED payment must never allow
  // creating another one, even if the order's own status hasn't reflected it yet.
  const isSettled = orderAlreadySettled || hasSucceededPayment

  async function handleCreatePayment() {
    if (isCreating || !order) return
    setIsCreating(true)
    setActionError(null)
    try {
      const { payment, paymentUrl } = await paymentApiService.createPayment({
        orderId: order.id,
        method,
        // Only meaningful for VNPAY — see paymentApiService.createPayment's doc
        // comment for why sending this is harmless even though the backend
        // doesn't consume it yet.
        ...(method === 'VNPAY'
          ? {
              // `orderId` is our own query param, not a VNPay one — VNPay preserves
              // unknown query params on the returnUrl it redirects back to, so
              // VnpayReturnPage has a reliable order reference even before/without
              // a verified backend response (see its `fallbackOrderId`).
              returnUrl: `${window.location.origin}${ROUTES.PAYMENT_VNPAY_RETURN}?orderId=${encodeURIComponent(order.id)}`,
            }
          : {}),
      })
      if (payment.method === 'VNPAY' && paymentUrl) {
        // VNPay is a hosted checkout — navigate the browser there directly.
        // Never a popup/new tab, and never our own card-number form.
        window.location.assign(paymentUrl)
        return
      }
      setPendingPaymentUrl(paymentUrl)
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

  const methods: Array<{ value: PaymentMethod; icon: ReactNode; label: string; description: string }> = [
    {
      value: 'VNPAY',
      icon: <Wallet className="size-5" />,
      label: t('payment.method.vnpay'),
      description: t('payment.method.vnpayDescription'),
    },
    {
      value: 'BANK_TRANSFER',
      icon: <Building2 className="size-5" />,
      label: t('payment.method.bankTransfer'),
      description: t('payment.method.bankTransferDescription'),
    },
    // Dev/test only — never rendered in production, mirroring the backend's own
    // 403-in-production guard on the sandbox-complete endpoint.
    ...(import.meta.env.DEV
      ? [
          {
            value: 'SANDBOX' as const,
            icon: <FlaskConical className="size-5" />,
            label: t('payment.method.sandbox'),
            description: t('payment.method.sandboxDescription'),
          },
        ]
      : []),
  ]

  const ctaLabelByMethod: Record<PaymentMethod, string> = {
    VNPAY: t('payment.payWithVnpay'),
    BANK_TRANSFER: t('payment.createBankTransfer'),
    SANDBOX: t('payment.createSandboxPayment'),
  }

  const productRows = order.items?.map((item) => (
    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{localize(item.productName, locale)}</p>
        {item.packageName && (
          <p className="truncate text-xs text-text-secondary">{localize(item.packageName, locale)}</p>
        )}
        <p className="text-xs text-text-secondary">
          {t('common.quantity')}: {item.quantity}
        </p>
      </div>
      <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-text-primary">
        {formatCurrency(item.totalPrice, locale)}
      </p>
    </div>
  ))

  const summary = (
    <CheckoutOrderSummary
      variant="embedded"
      subtotal={order.subtotal}
      discount={order.discountAmount}
      tax={order.taxAmount}
      total={order.totalAmount}
      locale={locale}
    />
  )

  const leftColumn = (
    <CheckoutReviewCard orderCode={order.orderCode} summary={summary}>
      {productRows}
    </CheckoutReviewCard>
  )

  return (
    <>
      <Seo title={t('payment.title')} />
      <CheckoutLayout
        {...backProps}
        currentStep={viewStep}
        onBackStep={viewStep === 2 ? () => setViewStep(1) : undefined}
        backStepLabel={t('checkout.layout.backStep')}
        left={leftColumn}
        mobileSummary={
          <MobileOrderSummary total={order.totalAmount} locale={locale}>
            <p className="mb-1 text-xs text-text-secondary">
              {t('checkout.success.orderCode')}: <span className="font-semibold text-text-primary">{order.orderCode}</span>
            </p>
            {productRows}
            {summary}
          </MobileOrderSummary>
        }
      >
        {viewStep === 1 ? (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{t('checkout.customerInfo.title')}</h2>
              <p className="mt-1 text-sm text-text-secondary">{t('checkout.customerInfo.description')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label={t('checkout.customerInfo.fullName')} value={order.customerName} readOnly className="h-12" />
              <Input label={t('checkout.customerInfo.phone')} value={order.customerPhone} readOnly className="h-12" />
            </div>

            <Input label={t('checkout.customerInfo.email')} value={order.customerEmail} readOnly className="h-12" />

            {order.note && <Textarea label={t('checkout.customerInfo.note')} value={order.note} readOnly rows={2} />}

            <Button size="lg" onClick={() => setViewStep(2)} className="w-full sm:w-auto sm:self-end">
              {t('checkout.customerInfo.continue')}
            </Button>
          </div>
        ) : (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t('payment.chooseMethod')}</h2>
          </div>

          {isSettled ? (
            <p className="rounded-xl border border-dashed border-border p-5 text-sm text-text-secondary">
              {t('payment.orderSettled')}
            </p>
          ) : !latestPayment || !isActionable ? (
            <div className="flex flex-col gap-4">
              <div role="radiogroup" aria-label={t('payment.chooseMethod')} className="flex flex-col gap-2.5">
                {methods.map((m) => (
                  <PaymentMethodCard
                    key={m.value}
                    icon={m.icon}
                    label={m.label}
                    description={m.description}
                    selected={method === m.value}
                    onSelect={() => setMethod(m.value)}
                    disabled={isCreating}
                  />
                ))}
              </div>

              <CheckoutSecurityNotice />

              {latestPayment && (
                <p className="rounded-xl border border-dashed border-red-400/40 bg-red-500/5 p-3 text-xs text-red-600">
                  {t('payment.retryNotice')}
                </p>
              )}

              {actionError && (
                <p role="alert" className="text-sm text-red-600">
                  {actionError}
                </p>
              )}

              <Button
                size="lg"
                isLoading={isCreating}
                aria-busy={isCreating}
                onClick={handleCreatePayment}
                className="w-full"
              >
                {ctaLabelByMethod[method]}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-4 text-sm">
                <div>
                  <p className="font-medium text-text-primary">{latestPayment.paymentCode}</p>
                  <p className="text-xs text-text-secondary">
                    {t(`payment.method.${methodDescriptionKey[latestPayment.method]}`)}
                  </p>
                </div>
                <PaymentStatusBadge status={latestPayment.status} />
              </div>

              {latestPayment.method === 'VNPAY' && pendingPaymentUrl && (
                <Button size="lg" className="w-full" onClick={() => window.location.assign(pendingPaymentUrl)}>
                  {t('payment.payWithVnpay')}
                </Button>
              )}

              {actionError && (
                <p role="alert" className="text-sm text-red-600">
                  {actionError}
                </p>
              )}

              {import.meta.env.DEV && latestPayment.method === 'SANDBOX' && (
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {t('payment.devTools.title')}
                  </p>
                  <p className="text-xs text-text-secondary">{t('payment.devTools.description')}</p>
                  <p className="text-xs text-text-secondary">{t('payment.sandboxInstructions')}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      size="sm"
                      isLoading={isCompleting}
                      aria-busy={isCompleting}
                      onClick={() => handleSandbox('SUCCESS')}
                      className="flex-1"
                    >
                      {t('payment.sandboxSuccess')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isCompleting}
                      onClick={() => handleSandbox('FAILURE')}
                      className="flex-1"
                    >
                      {t('payment.sandboxFailure')}
                    </Button>
                    <Button
                      size="sm"
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
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-fit text-text-secondary"
            onClick={() => navigate(ROUTES.ACCOUNT_ORDER_DETAIL(order.id))}
          >
            {t('payment.viewOrder')}
          </Button>
        </div>
        )}
      </CheckoutLayout>
    </>
  )
}
