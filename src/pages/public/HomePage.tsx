import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Accordion } from '@/components/common/Accordion'
import { Tabs } from '@/components/common/Tabs'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { Marquee } from '@/components/common/Marquee'
import { ProductGrid } from '@/components/product/ProductGrid'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { ProductScrollHero } from '@/components/home/ProductScrollHero'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { productService } from '@/services/productService'
import { contentService } from '@/services/contentService'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'
import { mockPartners } from '@/data/mocks/partners'
import type { Faq, Product } from '@/types'

const CATEGORIES = [
  { key: 'cloud', icon: 'Cloud', href: ROUTES.PRODUCTS_CLOUD, code: 'CLOUD' },
  { key: 'kaspersky', icon: 'ShieldCheck', href: ROUTES.PRODUCTS_KASPERSKY, code: 'SECURITY' },
  { key: 'esim', icon: 'Wifi', href: ROUTES.PRODUCTS_ESIM, code: 'ESIM' },
] as const

const PROCESS_STEPS = [
  { key: 'step1', icon: 'Search' },
  { key: 'step2', icon: 'SlidersHorizontal' },
  { key: 'step3', icon: 'CreditCard' },
  { key: 'step4', icon: 'Rocket' },
] as const

const CLOUD_FEATURES = [
  { key: 'f1', icon: 'Server' },
  { key: 'f2', icon: 'Gauge' },
  { key: 'f3', icon: 'ShieldCheck' },
  { key: 'f4', icon: 'Headphones' },
] as const

const KASPERSKY_FEATURES = [
  { key: 'f1', icon: 'Bug' },
  { key: 'f2', icon: 'CreditCard' },
  { key: 'f3', icon: 'ShieldAlert' },
  { key: 'f4', icon: 'EyeOff' },
] as const

const ESIM_FEATURES = [
  { key: 'f1', icon: 'Globe' },
  { key: 'f2', icon: 'Smartphone' },
  { key: 'f3', icon: 'QrCode' },
  { key: 'f4', icon: 'Layers' },
] as const

type FeaturedTab = 'all' | 'cloud' | 'kaspersky' | 'esim'

function Eyebrow({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em]',
        dark ? 'text-home-wire' : 'text-home-beacon',
      )}
    >
      <span className={cn('size-1.5 rounded-full', dark ? 'bg-home-wire' : 'bg-home-beacon')} />
      // {children}
    </span>
  )
}

function ReadoutHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark = false,
  className,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  dark?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          'font-display max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl',
          dark ? 'text-home-paper' : 'text-home-graphite',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('max-w-xl text-base leading-7', dark ? 'text-home-paper/60' : 'text-home-graphite-soft')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function ServiceProductVisual({
  src,
  alt,
  className,
  imageClassName,
}: {
  src: string
  alt: string
  className?: string
  imageClassName?: string
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-[320px] w-full items-center justify-center',
        'sm:min-h-[390px] lg:min-h-[480px]',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'block h-auto w-auto max-w-full object-contain',
          'transform-gpu [backface-visibility:hidden]',
          'drop-shadow-[0_28px_24px_rgba(5,27,51,0.16)]',
          imageClassName,
        )}
      />
    </div>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [featuredTab, setFeaturedTab] = useState<FeaturedTab>('all')
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true)

  const [faqs, setFaqs] = useState<Faq[]>([])

  useEffect(() => {
    setIsFeaturedLoading(true)
    const request =
      featuredTab === 'all'
        ? productService.getFeaturedProducts(6)
        : productService.getProducts({ category: featuredTab })
    request.then((products) => {
      setFeaturedProducts(products)
      setIsFeaturedLoading(false)
    })
  }, [featuredTab])

  useEffect(() => {
    Promise.all([contentService.getFaqs('general'), contentService.getFaqs('billing')]).then(
      ([generalFaqs, billingFaqs]) => {
        setFaqs([...generalFaqs, ...billingFaqs])
      },
    )
  }, [])

  return (
    <div className="font-plex">
      <Seo title={t('home.hero.title')} description={t('home.hero.subtitle')} />

      {/* ============ 1. HERO — scroll-driven Cloud → product lineup ============ */}
      <ProductScrollHero />

      {/* ============ 2. TRUSTED BY ============ */}
      <section className="relative overflow-hidden border-b border-home-line bg-home-paper px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,102,179,0.07) 0%, transparent 75%)',
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <RevealOnScroll>
              <h2 className="font-display text-balance text-2xl font-semibold leading-tight tracking-tight text-home-graphite sm:text-3xl">
                {t('home.partners.titlePrefix')}{' '}
                <span className="text-home-beacon">{t('home.partners.titleHighlight')}</span>
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.08}>
              <p className="mt-4 text-sm leading-6 text-home-graphite-soft sm:text-base">
                {t('home.partners.description')}
              </p>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.16} className="mt-10 border-t border-home-line pt-10 sm:mt-12">
            <Marquee
              gapClassName="gap-x-14 sm:gap-x-20 lg:gap-x-24"
              items={mockPartners}
              getKey={(partner) => partner.id}
              renderItem={(partner) => (
                <span className="font-display whitespace-nowrap text-xl font-semibold tracking-tight text-home-graphite/35 transition-colors duration-300 hover:text-home-graphite sm:text-2xl">
                  {partner.name}
                </span>
              )}
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 3. PRODUCT CATEGORIES — dark chapter, matches Purchase Process ============ */}
      <section className="relative overflow-hidden bg-home-ink px-4 py-24 text-home-paper sm:px-6 lg:px-8">
        <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <RevealOnScroll>
            <ReadoutHeading
              dark
              eyebrow={t('home.categories.eyebrow')}
              title={t('home.categories.title')}
              subtitle={t('home.categories.subtitle')}
              className="mb-14"
            />
          </RevealOnScroll>
          <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <StaggerItem key={category.key} className="h-full">
                <SpotlightCard
                  tone="none"
                  spotlightColor="rgba(0,174,239,0.16)"
                  className="h-full rounded-2xl"
                >
                  <Link
                    to={category.href}
                    className="group flex h-full flex-col gap-4 rounded-2xl border border-home-paper/10 bg-home-paper/[0.03] p-7 transition-colors duration-200 hover:border-home-wire/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-md border border-home-wire/30 bg-home-ink text-home-wire">
                        <DynamicIcon name={category.icon} className="size-5" />
                      </span>
                      <span className="font-data text-[11px] tracking-[0.1em] text-home-paper/40">
                        {category.code}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-home-paper">
                        {t(`home.categories.${category.key}.name`)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-home-paper/60">
                        {t(`home.categories.${category.key}.desc`)}
                      </p>
                      <ul className="mt-4 flex flex-col gap-1.5">
                        {(['b1', 'b2', 'b3'] as const).map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-home-paper/55">
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-home-wire" />
                            {t(`home.categories.${category.key}.${b}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-home-paper group-hover:gap-2.5 transition-[gap]">
                      {t('common.learnMore')}
                      <ArrowRight className="size-4 text-home-wire" />
                    </span>
                  </Link>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ 5. FEATURED PRODUCTS ============ */}
      <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <ReadoutHeading
              eyebrow={t('home.featured.eyebrow')}
              title={t('home.featured.title')}
              subtitle={t('home.featured.subtitle')}
              className="mb-10"
            />
          </RevealOnScroll>
          <RevealOnScroll delay={0.05} className="flex justify-center">
            <Tabs
              value={featuredTab}
              onChange={(v) => setFeaturedTab(v as FeaturedTab)}
              className="!border-home-line !bg-white/40"
              activePillClassName="!bg-home-ink"
              tabs={[
                { value: 'all', label: t('home.tabs.all') },
                { value: 'cloud', label: t('home.tabs.cloud') },
                { value: 'kaspersky', label: t('home.tabs.kaspersky') },
                { value: 'esim', label: t('home.tabs.esim') },
              ]}
            />
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <div className="mt-10">
              <ProductGrid products={featuredProducts} isLoading={isFeaturedLoading} />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 6. PURCHASE PROCESS — dark chapter, ordered steps ============ */}
      <section className="relative overflow-hidden bg-home-ink px-4 py-24 text-home-paper sm:px-6 lg:px-8">
        <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <RevealOnScroll>
            <ReadoutHeading dark eyebrow={t('home.process.eyebrow')} title={t('home.process.title')} className="mb-16" />
          </RevealOnScroll>
          <div className="relative flex flex-col gap-10">
            <div className="absolute left-[18px] top-2 h-[calc(100%-16px)] w-px bg-home-paper/10" />
            {PROCESS_STEPS.map((step, idx) => (
              <RevealOnScroll key={step.key} delay={idx * 0.1}>
                <div className="relative flex items-start gap-6">
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-home-wire/40 bg-home-ink font-data text-xs text-home-wire">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 border-b border-home-paper/10 pb-8">
                    <p className="flex items-center gap-2 font-display text-lg font-semibold text-home-paper">
                      <DynamicIcon name={step.icon} className="size-4 text-home-wire" />
                      {t(`home.process.${step.key}.title`)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-home-paper/55">
                      {t(`home.process.${step.key}.desc`)}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. CLOUD SECTION ============ */}
      <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <RevealOnScroll direction="left">
            <ReadoutHeading
              align="left"
              eyebrow={t('home.cloudSection.eyebrow')}
              title={t('home.cloudSection.title')}
              subtitle={t('home.cloudSection.subtitle')}
              className="mb-8"
            />
            <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CLOUD_FEATURES.map((feature) => (
                <StaggerItem key={feature.key}>
                  <div className="flex items-center gap-3 border border-home-line bg-white/40 p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-home-ink text-home-wire">
                      <DynamicIcon name={feature.icon} className="size-4" />
                    </span>
                    <p className="text-sm text-home-graphite-soft">{t(`home.cloudSection.${feature.key}`)}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1} direction="right">
            <ServiceProductVisual
              src="/images/home/cloud-service-3d-transparent.webp"
              alt="Biểu tượng hạ tầng điện toán đám mây với hệ thống máy chủ"
              imageClassName="max-h-[380px] drop-shadow-[0_28px_24px_rgba(5,27,51,0.16)] sm:max-h-[440px] lg:max-h-[500px]"
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 8. KASPERSKY — dark chapter, matches Purchase Process ============ */}
      <section className="relative overflow-hidden bg-home-ink px-4 py-24 text-home-paper sm:px-6 lg:px-8">
        <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <RevealOnScroll direction="left" className="order-2 lg:order-1">
            <ServiceProductVisual
              src="/images/home/kaspersky-security-3d-transparent.webp"
              alt="Biểu tượng khiên bảo mật cho dịch vụ Kaspersky"
              imageClassName="max-h-[320px] drop-shadow-[0_28px_24px_rgba(5,27,51,0.14)] sm:max-h-[380px] lg:max-h-[440px]"
            />
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="order-1 lg:order-2">
            <ReadoutHeading
              dark
              align="left"
              eyebrow={t('home.kasperskySection.eyebrow')}
              title={t('home.kasperskySection.title')}
              subtitle={t('home.kasperskySection.subtitle')}
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-3">
              {KASPERSKY_FEATURES.map((feature) => (
                <StaggerItem key={feature.key}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-home-wire" />
                    <span className="text-sm text-home-paper/60">
                      {t(`home.kasperskySection.${feature.key}`)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 9. eSIM ============ */}
      <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <RevealOnScroll direction="left">
            <ReadoutHeading
              align="left"
              eyebrow={t('home.esimSection.eyebrow')}
              title={t('home.esimSection.title')}
              subtitle={t('home.esimSection.subtitle')}
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-3">
              {ESIM_FEATURES.map((feature) => (
                <StaggerItem key={feature.key}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-home-beacon" />
                    <span className="text-sm text-home-graphite-soft">
                      {t(`home.esimSection.${feature.key}`)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1}>
            <ServiceProductVisual
              src="/images/home/esim-service-3d-transparent.webp"
              alt="Biểu tượng thẻ eSIM kỹ thuật số"
              imageClassName="max-h-[320px] drop-shadow-[0_28px_24px_rgba(5,27,51,0.15)] sm:max-h-[380px] lg:max-h-[440px]"
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 12. FAQ ============ */}
      {faqs.length > 0 && (
        <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <RevealOnScroll>
              <ReadoutHeading eyebrow={t('home.faq.eyebrow')} title={t('home.faq.title')} className="mb-12" />
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
        </section>
      )}
    </div>
  )
}
