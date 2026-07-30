import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface CheckoutReviewCardProps {
  /** Shown as small metadata in the header, never as its own separate card. */
  orderCode?: string
  /** Product rows — bounded to a max height and scrollable internally once the list is long. */
  children: ReactNode
  coupon?: ReactNode
  /** Pass `<CheckoutOrderSummary variant="embedded" .../>` — stays fixed below the (possibly scrolling) list. */
  summary: ReactNode
  className?: string
}

/**
 * The single unified left-column card: title, product list, coupon and order
 * summary all live inside one card — never split into separate stacked cards.
 * Sizes to its own content (no forced full-height stretch) so it stays as
 * compact as the cart actually is; only the product list itself scrolls if it
 * grows past a reasonable height, the summary always stays visible below it.
 */
export function CheckoutReviewCard({ orderCode, children, coupon, summary, className }: CheckoutReviewCardProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col rounded-3xl border border-border bg-background p-5', className)}>
      <header className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">{t('checkout.review.title')}</h2>
        {orderCode && (
          <div className="shrink-0 text-right">
            <p className="text-[11px] text-text-secondary">{t('checkout.success.orderCode')}</p>
            <p className="text-sm font-semibold text-text-primary">{orderCode}</p>
          </div>
        )}
      </header>

      <div className="mt-4 max-h-[340px] overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-2.5">{children}</div>
        {coupon && <div className="mt-3">{coupon}</div>}
      </div>

      <div className="mt-4 border-t border-border pt-4">{summary}</div>
    </div>
  )
}
