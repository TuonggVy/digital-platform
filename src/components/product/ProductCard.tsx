import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useLocale } from '@/hooks/useLocale'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { localize } from '@/utils/localize'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

const cycleLabelKey: Record<string, string> = {
  monthly: 'common.perMonth',
  yearly: 'common.perYear',
  one_time: 'common.oneTime',
}

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const addItem = useCartStore((s) => s.addItem)
  const showToast = useUiStore((s) => s.showToast)

  const defaultPackage = product.packages.find((p) => p.isPopular) ?? product.packages[0]

  function handleQuickAdd() {
    if (!defaultPackage) return
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: localize(product.name, locale),
      category: product.category,
      packageId: defaultPackage.id,
      packageName: localize(defaultPackage.name, locale),
      billingCycle: defaultPackage.billingCycle,
      unitPrice: defaultPackage.price,
      quantity: 1,
      optionsSummary: [],
    })
    showToast(t('toast.addedToCart'), 'success')
  }

  return (
    <div className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DynamicIcon name={product.icon} className="size-6" />
        </span>
        {product.badge && <Badge variant="primary">{localize(product.badge, locale)}</Badge>}
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold text-text-primary">
          {localize(product.name, locale)}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-text-secondary">
          {localize(product.shortDescription, locale)}
        </p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {product.features.slice(0, 3).map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" />
            {localize(feature, locale)}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        {product.rating} ({product.reviewCount} {t('common.reviews')})
      </div>

      <div>
        <p className="text-xs text-text-secondary">{t('common.startingFrom')}</p>
        <p className="text-xl font-bold text-text-primary">
          {formatCurrency(product.startingPrice, locale)}
          <span className="text-sm font-normal text-text-secondary">
            {t(cycleLabelKey[product.billingCycles[0]])}
          </span>
        </p>
      </div>

      <div className="flex gap-2">
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="flex-1">
          <Button variant="outline" className="w-full">
            {t('common.viewDetails')}
          </Button>
        </Link>
        <Button
          variant="primary"
          size="md"
          aria-label={t('common.addToCart')}
          onClick={handleQuickAdd}
        >
          <ShoppingCart className="size-4" />
        </Button>
      </div>
    </div>
  )
}
