import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { productService } from '@/services/productService'
import type { Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Tabs } from '@/components/common/Tabs'
import { PriceCard } from '@/components/common/PriceCard'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

// `StaggerContainer`/`StaggerItem` use `whileInView` + `viewport={{ once: true }}`,
// which fires once as soon as the (still-empty) grid mounts. Cards only exist once
// the async product fetch resolves, so by the time they're added the container's
// one-time trigger has already been consumed and they never animate in — they stay
// stuck at `opacity: 0` until a full reload replays the race differently. Animating
// on mount here instead (cards only ever mount once data is ready) sidesteps that
// entirely, so pricing cards are always visible regardless of navigation timing.
const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const reducedCardVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
}

export function PricingPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const prefersReducedMotion = useReducedMotion()
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

      <motion.div
        key={category}
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        {category === 'cloud' &&
          cloudServer &&
          cloudServer.packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              className="h-full"
              variants={prefersReducedMotion ? reducedCardVariants : cardVariants}
            >
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
            </motion.div>
          ))}

        {category !== 'cloud' &&
          products.map((product) => {
            const pkg = product.packages[0]
            if (!pkg) return null
            return (
              <motion.div
                key={product.id}
                className="h-full"
                variants={prefersReducedMotion ? reducedCardVariants : cardVariants}
              >
                <PriceCard
                  name={localize(product.name, locale)}
                  price={pkg.price}
                  billingSuffix={suffixFor(pkg.billingCycle)}
                  features={product.features.map((f) => localize(f, locale))}
                  isPopular={!!pkg.isPopular}
                  ctaHref={ROUTES.PRODUCT_DETAIL(product.slug)}
                  locale={locale}
                />
              </motion.div>
            )
          })}
      </motion.div>

      {cards.length === 0 && (
        <p className="mt-10 text-center text-text-secondary">{t('common.loading')}</p>
      )}
    </div>
  )
}
