import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import type { Locale } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface MobileOrderSummaryProps {
  total: number
  locale: Locale
  children: ReactNode
}

/** Collapsible order summary for mobile — the total stays visible whether expanded or not. */
export function MobileOrderSummary({ total, locale, children }: MobileOrderSummaryProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-background">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="focus-ring flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 text-text-secondary transition-transform motion-reduce:transition-none',
              isOpen && 'rotate-180',
            )}
          />
          {t('checkout.orderSummary')}
        </span>
        <span className="text-base font-bold text-primary">{formatCurrency(total, locale)}</span>
      </button>
      {isOpen && <div className="flex flex-col gap-3 border-t border-border p-4 pt-4">{children}</div>}
    </div>
  )
}
