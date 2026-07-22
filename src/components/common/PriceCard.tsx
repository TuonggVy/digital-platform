import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import { FeatureList } from './FeatureList'
import { Button } from './Button'
import { Badge } from './Badge'
import type { Locale } from '@/types'

export interface PriceCardSpec {
  label: string
  value: string
}

interface PriceCardProps {
  name: string
  price: number
  billingSuffix: string
  /** Structured specs (e.g. CPU/RAM/SSD) — shown before generic feature bullets. */
  specs?: PriceCardSpec[]
  /** Short marketing bullets, shown after specs if provided. */
  features?: string[]
  isPopular?: boolean
  ctaHref: string
  locale: Locale
}

export function PriceCard({
  name,
  price,
  billingSuffix,
  specs,
  features,
  isPopular,
  ctaHref,
  locale,
}: PriceCardProps) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'relative flex h-full flex-col gap-4 rounded-xl border p-6 transition-colors duration-200',
        isPopular
          ? 'border-primary/30 border-l-2 border-l-primary bg-primary/[0.03]'
          : 'border-border bg-background hover:border-primary/40',
      )}
    >
      {isPopular && (
        <Badge variant="primary" className="w-fit">
          {t('pricingPage.mostPopular')}
        </Badge>
      )}
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-text-primary">
            {formatCurrency(price, locale)}
          </span>
          <span className="text-sm text-text-secondary">{billingSuffix}</span>
        </div>
      </div>

      {specs && specs.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 border-t border-border/70 pt-4 sm:grid-cols-3">
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-0.5">
              <dt className="text-[11px] text-text-secondary">{spec.label}</dt>
              <dd className="truncate text-sm font-medium text-text-primary" title={spec.value}>
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {features && features.length > 0 && <FeatureList items={features} />}

      <Link to={ctaHref} className="mt-auto">
        <Button variant={isPopular ? 'primary' : 'outline'} className="w-full">
          {t('common.viewDetails')}
        </Button>
      </Link>
    </div>
  )
}
