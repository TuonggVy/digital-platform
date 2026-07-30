import { useTranslation } from 'react-i18next'
import { Server, ShieldCheck, Smartphone } from 'lucide-react'
import type { CartItem, Locale } from '@/types'
import { formatCurrency } from '@/utils/formatters'

const categoryIcon: Record<CartItem['category'], typeof Server> = {
  cloud: Server,
  kaspersky: ShieldCheck,
  esim: Smartphone,
}

const cycleLabelKey: Record<string, string> = {
  monthly: 'common.perMonth',
  yearly: 'common.perYear',
  one_time: 'common.oneTime',
}

interface CheckoutProductReviewProps {
  items: CartItem[]
  locale: Locale
}

/**
 * Read-only product rows — no quantity/remove controls, this is a checkpoint,
 * not the cart editor. Renders bare rows only; the title and surrounding card
 * chrome belong to the parent `CheckoutReviewCard`, not this component.
 */
export function CheckoutProductReview({ items, locale }: CheckoutProductReviewProps) {
  const { t } = useTranslation()

  return (
    <>
      {items.map((item) => {
        const Icon = categoryIcon[item.category]
        return (
          <div key={item.cartItemId} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{item.productName}</p>
              <p className="truncate text-xs text-text-secondary">
                {item.packageName} · {t('common.quantity')} {item.quantity} · {t(cycleLabelKey[item.billingCycle])}
              </p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-text-primary">
              {formatCurrency(item.unitPrice * item.quantity, locale)}
            </p>
          </div>
        )
      })}
    </>
  )
}
