import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { productService } from '@/services/productService'
import type { Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Tabs } from '@/components/common/Tabs'
import { PriceCard } from '@/components/common/PriceCard'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

export function PricingPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const [category, setCategory] = useState<'cloud' | 'kaspersky' | 'esim'>('cloud')
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    productService.getProducts({ category }).then(setProducts)
  }, [category])

  const cloudServer = products.find((p) => p.subCategory === 'cloud-server')
  const showBillingToggle = category === 'cloud'

  function priceFor(price: number, cycle: string) {
    if (category === 'cloud' && billing === 'yearly' && cycle === 'monthly') return price * 10
    return price
  }

  function suffixFor(cycle: string) {
    if (category === 'cloud' && billing === 'yearly' && cycle === 'monthly')
      return t('common.perYear')
    if (cycle === 'monthly') return t('common.perMonth')
    if (cycle === 'yearly') return t('common.perYear')
    return ` (${t('common.oneTime')})`
  }

  const cards =
    category === 'cloud' && cloudServer
      ? cloudServer.packages
      : products.map((p) => p.packages[0]).filter(Boolean)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Seo title={t('pricingPage.title')} description={t('pricingPage.subtitle')} />

      <RevealOnScroll className="text-center">
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('pricingPage.title')}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-text-secondary">{t('pricingPage.subtitle')}</p>
      </RevealOnScroll>

      <div className="mt-8 flex justify-center">
        <Tabs
          value={category}
          onChange={(v) => setCategory(v as typeof category)}
          tabs={[
            { value: 'cloud', label: t('pricingPage.tabs.cloud') },
            { value: 'kaspersky', label: t('pricingPage.tabs.kaspersky') },
            { value: 'esim', label: t('pricingPage.tabs.esim') },
          ]}
        />
      </div>

      {showBillingToggle && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center rounded-lg border border-border p-1 text-sm font-medium">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'rounded-md px-4 py-1.5',
                billing === 'monthly' ? 'bg-primary text-white' : 'text-text-secondary',
              )}
            >
              {t('pricingPage.monthly')}
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'rounded-md px-4 py-1.5',
                billing === 'yearly' ? 'bg-primary text-white' : 'text-text-secondary',
              )}
            >
              {t('pricingPage.yearly')}
            </button>
          </div>
        </div>
      )}

      <StaggerContainer className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {category === 'cloud' &&
          cloudServer &&
          cloudServer.packages.map((pkg) => (
            <StaggerItem key={pkg.id} className="h-full">
              <PriceCard
                name={localize(pkg.name, locale)}
                price={priceFor(pkg.price, pkg.billingCycle)}
                billingSuffix={suffixFor(pkg.billingCycle)}
                features={[
                  pkg.cloud?.cpu ?? '',
                  pkg.cloud?.ram ?? '',
                  pkg.cloud?.ssd ?? '',
                  pkg.cloud?.bandwidth ?? '',
                ].filter(Boolean)}
                isPopular={!!pkg.isPopular}
                ctaHref={ROUTES.PRODUCT_DETAIL(cloudServer.slug)}
                locale={locale}
              />
            </StaggerItem>
          ))}

        {category !== 'cloud' &&
          products.map((product) => {
            const pkg = product.packages[0]
            if (!pkg) return null
            return (
              <StaggerItem key={product.id} className="h-full">
                <PriceCard
                  name={localize(product.name, locale)}
                  price={pkg.price}
                  billingSuffix={suffixFor(pkg.billingCycle)}
                  features={product.features.map((f) => localize(f, locale))}
                  isPopular={!!pkg.isPopular}
                  ctaHref={ROUTES.PRODUCT_DETAIL(product.slug)}
                  locale={locale}
                />
              </StaggerItem>
            )
          })}
      </StaggerContainer>

      {cards.length === 0 && (
        <p className="mt-10 text-center text-text-secondary">{t('common.loading')}</p>
      )}
    </div>
  )
}
