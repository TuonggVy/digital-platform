import { useTranslation } from 'react-i18next'
import type { Locale } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface CheckoutOrderSummaryProps {
  subtotal: number
  discount: number
  /** Omitted entirely unless the backend actually returned a positive tax amount. */
  tax?: number
  total: number
  locale: Locale
  couponCode?: string
  className?: string
  /**
   * `card` (default): a standalone bordered surface — used wherever the summary
   * stands alone. `embedded`: no border/background/padding of its own, meant to
   * sit inside a parent card (e.g. `CheckoutReviewCard`) that already owns the
   * surrounding chrome — avoids nesting a card inside a card.
   */
  variant?: 'card' | 'embedded'
}

/** Subtotal/discount/tax/total breakdown — the same shape on CheckoutPage (cart preview) and PaymentPage (order data). */
export function CheckoutOrderSummary({
  subtotal,
  discount,
  tax,
  total,
  locale,
  couponCode,
  className,
  variant = 'card',
}: CheckoutOrderSummaryProps) {
  const { t } = useTranslation()

  const rows = (
    <>
      <div className="flex items-center justify-between text-text-secondary">
        <span>{t('cart.subtotal')}</span>
        <span className="font-medium text-text-primary">{formatCurrency(subtotal, locale)}</span>
      </div>

      {discount > 0 && (
        <div className="flex items-center justify-between text-red-500">
          <span>{t('cart.discount')}</span>
          <span className="font-medium">-{formatCurrency(discount, locale)}</span>
        </div>
      )}

      {couponCode && (
        <div className="flex items-center justify-between text-text-secondary">
          <span>{t('checkout.summary.appliedCoupon')}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {couponCode}
          </span>
        </div>
      )}

      {typeof tax === 'number' && tax > 0 && (
        <div className="flex items-center justify-between text-text-secondary">
          <span>{t('account.orderDetail.tax')}</span>
          <span className="font-medium text-text-primary">{formatCurrency(tax, locale)}</span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
        <span className="text-base font-semibold text-text-primary">{t('cart.total')}</span>
        <span className="text-xl font-bold text-primary">{formatCurrency(total, locale)}</span>
      </div>
    </>
  )

  if (variant === 'embedded') {
    return <div className={cn('flex flex-col gap-2 text-sm', className)}>{rows}</div>
  }

  return (
    <div className={cn('flex flex-col gap-2 rounded-2xl border border-border bg-background p-5 text-sm', className)}>
      {rows}
    </div>
  )
}
