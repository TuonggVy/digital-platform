import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ProductSpecList } from './ProductSpecList'
import { useLocale } from '@/hooks/useLocale'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { localize } from '@/utils/localize'
import { formatCurrency } from '@/utils/formatters'
import { resolveDisplayPackage } from '@/utils/productPricing'
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

  // Same package for price, billing cycle and specs — see resolveDisplayPackage.
  const resolved = resolveDisplayPackage(product)

  function handleQuickAdd() {
    if (!resolved) return
    const { pkg } = resolved
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: localize(product.name, locale),
      category: product.category,
      packageId: pkg.id,
      packageName: localize(pkg.name, locale),
      billingCycle: pkg.billingCycle,
      unitPrice: pkg.price,
      quantity: 1,
      optionsSummary: [],
    })
    showToast(t('toast.addedToCart'), 'success')
  }

  return (
    <div className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-background p-5 transition-colors duration-200 hover:border-primary/40">
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <DynamicIcon name={product.icon} className="size-5" />
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

      <ProductSpecList product={product} pkg={resolved?.pkg} />

      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        {product.rating} ({product.reviewCount} {t('common.reviews')})
      </div>

      {resolved ? (
        <div>
          {resolved.isStartingPrice && (
            <p className="text-xs text-text-secondary">{t('common.startingFrom')}</p>
          )}
          <p className="text-xl font-bold text-text-primary">
            {formatCurrency(resolved.price, locale)}
            <span className="text-sm font-normal text-text-secondary">
              {t(cycleLabelKey[resolved.pkg.billingCycle])}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-text-secondary">{t('common.contactForPricing')}</p>
      )}

      <div className="flex gap-2">
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="flex-1">
          <Button variant="outline" className="w-full">
            {t('common.viewDetails')}
          </Button>
        </Link>
        {resolved && (
          <Button
            variant="primary"
            size="md"
            aria-label={t('common.addToCart')}
            onClick={handleQuickAdd}
          >
            <ShoppingCart className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
