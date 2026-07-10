import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import { FeatureList } from './FeatureList'
import { Button } from './Button'
import { Badge } from './Badge'
import type { Locale } from '@/types'

interface PriceCardProps {
  name: string
  price: number
  billingSuffix: string
  features: string[]
  isPopular?: boolean
  ctaHref: string
  locale: Locale
}

export function PriceCard({
  name,
  price,
  billingSuffix,
  features,
  isPopular,
  ctaHref,
  locale,
}: PriceCardProps) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'relative flex h-full flex-col gap-5 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1',
        isPopular
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border bg-background',
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
          <span className="text-3xl font-bold text-text-primary">
            {formatCurrency(price, locale)}
          </span>
          <span className="text-sm text-text-secondary">{billingSuffix}</span>
        </div>
      </div>
      <FeatureList items={features} />
      <Link to={ctaHref} className="mt-auto">
        <Button variant={isPopular ? 'primary' : 'outline'} className="w-full">
          {t('common.viewDetails')}
        </Button>
      </Link>
    </div>
  )
}
