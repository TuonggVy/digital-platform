import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { productService } from '@/services/productService'
import { contentService } from '@/services/contentService'
import type { Faq, Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Tabs } from '@/components/common/Tabs'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ComparisonTable, type ComparisonRow } from '@/components/common/ComparisonTable'
import { Accordion } from '@/components/common/Accordion'
import { PriceCard } from '@/components/common/PriceCard'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCategoryHero } from '@/components/product/ProductCategoryHero'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { formatCurrency } from '@/utils/formatters'
import { resolveDisplayPackage } from '@/utils/productPricing'
import { ROUTES } from '@/constants/routes'

type Category = 'cloud' | 'kaspersky' | 'esim'
type Billing = 'monthly' | 'yearly'

function suffixFor(cycle: string, applyYearlyBilling: boolean, t: (key: string) => string) {
  if (applyYearlyBilling && cycle === 'monthly') return t('common.perYear')
  if (cycle === 'monthly') return t('common.perMonth')
  if (cycle === 'yearly') return t('common.perYear')
  return ` (${t('common.oneTime')})`
}

function priceFor(price: number, cycle: string, applyYearlyBilling: boolean) {
  if (applyYearlyBilling && cycle === 'monthly') return price * 10
  return price
}

export function PricingPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const prefersReducedMotion = useReducedMotion()

  const [category, setCategory] = useState<Category>('cloud')
  const [billing, setBilling] = useState<Billing>('monthly')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [faqs, setFaqs] = useState<Faq[]>([])

  useEffect(() => {
    setIsLoading(true)
    productService.getProducts({ category }).then((result) => {
      setProducts(result)
      setIsLoading(false)
    })
  }, [category])

  useEffect(() => {
    contentService.getFaqs('billing').then(setFaqs)
  }, [])

  const cloudServer = category === 'cloud' ? products.find((p) => p.subCategory === 'cloud-server') : undefined
  // The monthly→yearly ×10 calculation is existing business logic (unchanged) and only
  // ever applied to Cloud Server, the one Cloud product whose packages actually carry a
  // 'monthly' billingCycle and whose product record declares 'yearly' as a supported cycle.
  const supportsYearlyBilling = !!cloudServer?.billingCycles.includes('yearly')
  const applyYearlyBilling = billing === 'yearly' && supportsYearlyBilling

  const cloudCompareRows: ComparisonRow[] = useMemo(() => {
    if (!cloudServer) return []
    return [
      { label: t('productDetail.cpu'), values: cloudServer.packages.map((p) => p.cloud?.cpu ?? '-') },
      { label: t('productDetail.ram'), values: cloudServer.packages.map((p) => p.cloud?.ram ?? '-') },
      { label: t('productDetail.ssd'), values: cloudServer.packages.map((p) => p.cloud?.ssd ?? '-') },
      {
        label: t('productDetail.bandwidth'),
        values: cloudServer.packages.map((p) => p.cloud?.bandwidth ?? '-'),
      },
      {
        label: t('productDetail.region'),
        values: cloudServer.packages.map((p) => p.cloud?.regions.join(', ') ?? '-'),
      },
      {
        label: t('common.startingFrom'),
        values: cloudServer.packages.map(
          (p) =>
            `${formatCurrency(priceFor(p.price, p.billingCycle, applyYearlyBilling), locale)}${suffixFor(p.billingCycle, applyYearlyBilling, t)}`,
        ),
      },
    ]
  }, [cloudServer, applyYearlyBilling, locale, t])

  const kasperskyProducts = useMemo(
    () => (category === 'kaspersky' ? products : []),
    [category, products],
  )
  const kasperskyCompareRows: ComparisonRow[] = useMemo(() => {
    if (kasperskyProducts.length === 0) return []
    return [
      {
        label: t('productDetail.devices'),
        values: kasperskyProducts.map((p) => {
          const deviceCounts = p.packages.map((pkg) => pkg.kaspersky?.devices ?? 0)
          const max = deviceCounts.length > 0 ? Math.max(...deviceCounts) : 0
          return max > 0 ? String(max) : '-'
        }),
      },
      {
        label: t('productDetail.duration'),
        values: kasperskyProducts.map((p) => p.packages[0]?.kaspersky?.duration ?? '-'),
      },
      { label: t('home.kasperskySection.f1'), values: kasperskyProducts.map(() => true) },
      { label: 'VPN', values: kasperskyProducts.map((p) => p.subCategory !== 'standard') },
      { label: t('home.kasperskySection.f3'), values: kasperskyProducts.map(() => true) },
      {
        label: 'Password Manager',
        values: kasperskyProducts.map((p) => p.subCategory !== 'standard'),
      },
      {
        label: t('common.startingFrom'),
        values: kasperskyProducts.map((p) => {
          const resolved = resolveDisplayPackage(p)
          return resolved ? formatCurrency(resolved.price, locale) : '-'
        }),
      },
    ]
  }, [kasperskyProducts, locale, t])
  const kasperskyHighlightIndex = kasperskyProducts.findIndex((p) => !!p.badge)

  // eSIM destinations are not one comparable set — only compare within a region that
  // actually has multiple plans (a single-plan region has nothing to compare against).
  const esimAsiaProducts = useMemo(
    () => (category === 'esim' ? products.filter((p) => p.subCategory === 'asia') : []),
    [category, products],
  )
  const esimCompareRows: ComparisonRow[] = useMemo(() => {
    if (esimAsiaProducts.length < 2) return []
    return [
      {
        label: t('productDetail.country'),
        values: esimAsiaProducts.map((p) => localize(p.packages[0]?.esim?.country ?? { vi: '-', en: '-' }, locale)),
      },
      {
        label: t('productDetail.dataAmount'),
        values: esimAsiaProducts.map((p) => p.packages[0]?.esim?.dataAmount ?? '-'),
      },
      {
        label: t('productDetail.days'),
        values: esimAsiaProducts.map((p) => String(p.packages[0]?.esim?.days ?? '-')),
      },
      {
        label: t('common.startingFrom'),
        values: esimAsiaProducts.map((p) => {
          const resolved = resolveDisplayPackage(p)
          return resolved ? formatCurrency(resolved.price, locale) : '-'
        }),
      },
    ]
  }, [esimAsiaProducts, locale, t])
  const esimHighlightIndex = esimAsiaProducts.findIndex((p) => !!p.badge)

  function cloudServerSpecs(pkg: Product['packages'][number]) {
    const entries: { label: string; value: string }[] = [
      { label: t('productDetail.cpu'), value: pkg.cloud?.cpu ?? '' },
      { label: t('productDetail.ram'), value: pkg.cloud?.ram ?? '' },
      { label: t('productDetail.ssd'), value: pkg.cloud?.ssd ?? '' },
    ]
    return entries.filter((entry) => entry.value && entry.value !== '-')
  }

  return (
    <div>
      <Seo title={t('pricingPage.title')} description={t('pricingPage.subtitle')} />

      <ProductCategoryHero
        eyebrow={t('pricingPage.eyebrow')}
        title={t('pricingPage.title')}
        subtitle={t('pricingPage.subtitle')}
        visual="platform"
        breadcrumbItems={[{ label: t('pricingPage.title') }]}
      />

      <div className="relative z-10 mx-auto -mt-6 flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
        <Tabs
          value={category}
          onChange={(v) => setCategory(v as Category)}
          className="shadow-[0_10px_28px_-14px_rgba(11,31,51,0.35)]"
          tabs={[
            { value: 'cloud', label: t('pricingPage.tabs.cloud') },
            { value: 'kaspersky', label: t('pricingPage.tabs.kaspersky') },
            { value: 'esim', label: t('pricingPage.tabs.esim') },
          ]}
        />
      </div>

      <motion.div
        key={category}
        className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.3 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {category === 'cloud' && (
          <>
            <RevealOnScroll>
              <SectionHeading title={t('pricingPage.allCloudTitle')} align="left" className="mb-8" />
            </RevealOnScroll>
            <ProductGrid products={products} isLoading={isLoading} />

            {!isLoading && cloudServer && (
              <div className="mt-16">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <RevealOnScroll>
                    <SectionHeading
                      title={t('pricingPage.cloudServerTiersTitle')}
                      align="left"
                    />
                  </RevealOnScroll>
                  {supportsYearlyBilling && (
                    <RevealOnScroll delay={0.05} className="flex flex-col items-start gap-1.5 sm:items-end">
                      <span className="text-xs text-text-secondary">
                        {t('pricingPage.billingToggleScope', { name: localize(cloudServer.name, locale) })}
                      </span>
                      <div
                        role="group"
                        aria-label={t('productDetail.billingCycle')}
                        className="flex items-center rounded-lg border border-border p-1 text-sm font-medium"
                      >
                        <button
                          type="button"
                          aria-pressed={billing === 'monthly'}
                          onClick={() => setBilling('monthly')}
                          className={
                            billing === 'monthly'
                              ? 'rounded-md bg-primary px-4 py-1.5 text-white'
                              : 'rounded-md px-4 py-1.5 text-text-secondary'
                          }
                        >
                          {t('pricingPage.monthly')}
                        </button>
                        <button
                          type="button"
                          aria-pressed={billing === 'yearly'}
                          onClick={() => setBilling('yearly')}
                          className={
                            billing === 'yearly'
                              ? 'rounded-md bg-primary px-4 py-1.5 text-white'
                              : 'rounded-md px-4 py-1.5 text-text-secondary'
                          }
                        >
                          {t('pricingPage.yearly')}
                        </button>
                      </div>
                    </RevealOnScroll>
                  )}
                </div>

                <StaggerContainer
                  key={billing}
                  className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {cloudServer.packages.map((pkg) => (
                    <StaggerItem key={pkg.id} className="h-full">
                      <PriceCard
                        name={localize(pkg.name, locale)}
                        price={priceFor(pkg.price, pkg.billingCycle, applyYearlyBilling)}
                        billingSuffix={suffixFor(pkg.billingCycle, applyYearlyBilling, t)}
                        specs={cloudServerSpecs(pkg)}
                        isPopular={!!pkg.isPopular}
                        ctaHref={ROUTES.PRODUCT_DETAIL(cloudServer.slug)}
                        locale={locale}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                <RevealOnScroll delay={0.1} className="mt-10">
                  <ComparisonTable
                    columns={cloudServer.packages.map((p) => localize(p.name, locale))}
                    rows={cloudCompareRows}
                    highlightColumnIndex={cloudServer.packages.findIndex((p) => p.isPopular)}
                  />
                </RevealOnScroll>
              </div>
            )}
          </>
        )}

        {category === 'kaspersky' && (
          <>
            <RevealOnScroll>
              <SectionHeading title={t('pricingPage.allKasperskyTitle')} align="left" className="mb-8" />
            </RevealOnScroll>
            <ProductGrid products={products} isLoading={isLoading} />

            {!isLoading && kasperskyCompareRows.length > 0 && (
              <div className="mt-16">
                <RevealOnScroll>
                  <SectionHeading title={t('pricingPage.compareKasperskyTitle')} align="left" className="mb-8" />
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <ComparisonTable
                    columns={kasperskyProducts.map((p) => localize(p.name, locale))}
                    rows={kasperskyCompareRows}
                    highlightColumnIndex={kasperskyHighlightIndex}
                  />
                </RevealOnScroll>
              </div>
            )}
          </>
        )}

        {category === 'esim' && (
          <>
            <RevealOnScroll>
              <SectionHeading title={t('pricingPage.allEsimTitle')} align="left" className="mb-8" />
            </RevealOnScroll>
            <ProductGrid products={products} isLoading={isLoading} />

            {!isLoading && esimCompareRows.length > 0 && (
              <div className="mt-16">
                <RevealOnScroll>
                  <SectionHeading title={t('pricingPage.compareEsimAsiaTitle')} align="left" className="mb-8" />
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <ComparisonTable
                    columns={esimAsiaProducts.map((p) => localize(p.name, locale))}
                    rows={esimCompareRows}
                    highlightColumnIndex={esimHighlightIndex}
                  />
                </RevealOnScroll>
              </div>
            )}
          </>
        )}

        <RevealOnScroll className="mt-16 rounded-xl border border-border bg-surface/40 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-text-primary">{t('pricingPage.notesTitle')}</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
              {t(`pricingPage.notes.${category}`)}
            </li>
            {category === 'esim' && (
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                {t('productDetail.activationTime')}: {t('productDetail.activationOnArrival')}
              </li>
            )}
          </ul>
        </RevealOnScroll>

        {faqs.length > 0 && (
          <div className="mx-auto mt-16 max-w-3xl">
            <RevealOnScroll>
              <SectionHeading title={t('pricingPage.faqTitle')} className="mb-8" />
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <Accordion
                items={faqs.map((faq) => ({
                  id: faq.id,
                  question: localize(faq.question, locale),
                  answer: localize(faq.answer, locale),
                }))}
              />
            </RevealOnScroll>
          </div>
        )}
      </motion.div>
    </div>
  )
}
