import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface OrderSummaryCardProps {
  subtotal: number
  discount: number
  total: number
  locale: Locale
  title?: string
  children?: ReactNode
  className?: string
}

/** Shared subtotal/discount/total summary block used on the cart and checkout pages. */
export function OrderSummaryCard({
  subtotal,
  discount,
  total,
  locale,
  title,
  children,
  className,
}: OrderSummaryCardProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('rounded-2xl border border-border bg-surface/40 p-5 sm:p-6', className)}>
      {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}

      <div className={cn('flex flex-col gap-2 text-sm', title && 'mt-4')}>
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
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <span className="text-base font-semibold text-text-primary">{t('cart.total')}</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(total, locale)}</span>
        </div>
      </div>

      {children && <div className="mt-5 flex flex-col gap-3">{children}</div>}
    </div>
  )
}
