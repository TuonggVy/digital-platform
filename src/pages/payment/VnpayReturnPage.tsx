import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'
import { paymentApiService } from '@/services/paymentApiService'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout'
import type { CheckoutStep } from '@/components/checkout/CheckoutStepper'

type ReturnState =
  | { kind: 'verifying' }
  | { kind: 'success'; orderId: string; orderCode: string; totalAmount: number }
  | { kind: 'failed'; orderId: string | null }
  | { kind: 'cancelled'; orderId: string | null }
  | { kind: 'notFound'; orderId: string | null }

/**
 * Renders the outcome of a VNPay redirect. Never trusts the raw `vnp_*` query
 * string as the actual result — the backend's verified response is the only
 * source of truth (see `paymentApiService.verifyVnpayReturn`'s doc comment:
 * that endpoint doesn't exist yet, so this page's "call the backend, render
 * its verdict" shape is ready but not exercised against a real transaction
 * until the backend implements it). IPN — the actual SUCCEEDED/PAID
 * transition — is entirely the backend's responsibility; this page only
 * reflects what it reports, it never decides payment success itself.
 */
export function VnpayReturnPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocale()
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<ReturnState>({ kind: 'verifying' })

  // Set by PaymentPage when building the VNPay returnUrl, so we have a usable
  // order reference even before/without a verified backend response.
  const fallbackOrderId = searchParams.get('orderId')

  useEffect(() => {
    let active = true
    const query = Object.fromEntries(searchParams.entries())

    paymentApiService
      .verifyVnpayReturn(query)
      .then((result) => {
        if (!active) return
        const orderId = result.order.id ?? fallbackOrderId
        if (result.payment.status === 'SUCCEEDED') {
          setState({
            kind: 'success',
            orderId,
            orderCode: result.order.orderCode,
            totalAmount: result.order.totalAmount,
          })
        } else if (result.payment.status === 'CANCELLED') {
          setState({ kind: 'cancelled', orderId })
        } else {
          setState({ kind: 'failed', orderId })
        }
      })
      .catch(() => {
        if (!active) return
        setState({ kind: 'notFound', orderId: fallbackOrderId })
      })

    return () => {
      active = false
    }
    // Query params are read once, on the redirect landing — re-running on
    // every searchParams identity change would refire the verify call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentStep: CheckoutStep = state.kind === 'success' ? 3 : 2

  function renderContent() {
    switch (state.kind) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <LoadingSpinner label={t('payment.return.verifying')} />
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('payment.return.success.title')}</h2>
              <p className="mt-1 text-sm text-text-secondary">{t('payment.return.success.description')}</p>
            </div>
            <div className="w-full rounded-2xl border border-border bg-surface p-4 text-sm">
              <div className="flex items-center justify-between border-b border-border py-2">
                <span className="text-text-secondary">{t('checkout.success.orderCode')}</span>
                <span className="font-semibold text-text-primary">{state.orderCode}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary">{t('checkout.success.total')}</span>
                <span className="font-semibold text-primary">{formatCurrency(state.totalAmount, locale)}</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => navigate(ROUTES.ACCOUNT_ORDER_DETAIL(state.orderId))}>
              {t('payment.viewOrder')}
            </Button>
          </div>
        )

      case 'failed':
      case 'cancelled': {
        const copyKey = state.kind
        return (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              {state.kind === 'failed' ? (
                <XCircle className="size-8" aria-hidden="true" />
              ) : (
                <AlertTriangle className="size-8" aria-hidden="true" />
              )}
            </span>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t(`payment.return.${copyKey}.title`)}</h2>
              <p className="mt-1 text-sm text-text-secondary">{t(`payment.return.${copyKey}.description`)}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              {state.orderId && (
                <Button className="flex-1" onClick={() => navigate(ROUTES.CHECKOUT_PAYMENT(state.orderId as string))}>
                  {t('payment.return.retry')}
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  navigate(state.orderId ? ROUTES.ACCOUNT_ORDER_DETAIL(state.orderId) : ROUTES.ACCOUNT_ORDERS)
                }
              >
                {t('payment.viewOrder')}
              </Button>
            </div>
          </div>
        )
      }

      case 'notFound':
        return (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface text-text-secondary">
              <HelpCircle className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('payment.return.notFound.title')}</h2>
              <p className="mt-1 text-sm text-text-secondary">{t('payment.return.notFound.description')}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                navigate(state.orderId ? ROUTES.CHECKOUT_PAYMENT(state.orderId) : ROUTES.ACCOUNT_ORDERS)
              }
            >
              {t('common.back')}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Seo title={t('payment.title')} />
      <CheckoutLayout
        backTo={ROUTES.ACCOUNT_ORDERS}
        backLabel={t('checkout.layout.backToOrders')}
        currentStep={currentStep}
        left={null}
      >
        <div className="mx-auto flex w-full max-w-md flex-col">{renderContent()}</div>
      </CheckoutLayout>
    </>
  )
}
