import { useTranslation } from 'react-i18next'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'

const cycleLabelKey: Record<string, string> = {
  monthly: 'common.perMonth',
  yearly: 'common.perYear',
  one_time: 'common.oneTime',
}

export function CartItemRow({ item, compact }: { item: CartItem; compact?: boolean }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{item.productName}</p>
        <p className="text-xs text-text-secondary">
          {t('cart.package')}: {item.packageName} · {t(cycleLabelKey[item.billingCycle])}
        </p>
        {!compact && item.optionsSummary.length > 0 && (
          <p className="mt-1 text-xs text-text-secondary">{item.optionsSummary.join(' · ')}</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
              className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center text-sm text-text-primary">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              aria-label="Increase quantity"
              className="p-1.5 text-text-secondary hover:text-text-primary"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.cartItemId)}
            aria-label={t('cart.remove')}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-500"
          >
            <Trash2 className="size-3.5" />
            {t('cart.remove')}
          </button>
        </div>
      </div>
      <p className="whitespace-nowrap text-sm font-semibold text-text-primary">
        {formatCurrency(item.unitPrice * item.quantity, locale)}
      </p>
    </div>
  )
}
