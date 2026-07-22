import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Star, CheckCircle2 } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Accordion } from '@/components/common/Accordion'
import { Tabs } from '@/components/common/Tabs'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { Marquee } from '@/components/common/Marquee'
import { ProductGrid } from '@/components/product/ProductGrid'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { AnimatedCounter } from '@/components/animation/AnimatedCounter'
import { Hero } from '@/components/home/Hero'
import { CloudInfrastructureVisual } from '@/components/visuals/cloud3d/CloudInfrastructureVisual'
import { SecurityPerimeterVisual } from '@/components/visuals/security3d/SecurityPerimeterVisual'
import { EsimConnectionVisual } from '@/components/visuals/esim3d/EsimConnectionVisual'
import { SWEEP_EXIT_X } from '@/components/home/HeroBackground'
import { productService } from '@/services/productService'
import { contentService } from '@/services/contentService'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'
import { mockPartners } from '@/data/mocks/partners'
import type { Faq, Product, Testimonial } from '@/types'

const CATEGORIES = [
  { key: 'cloud', icon: 'Cloud', href: ROUTES.PRODUCTS_CLOUD, code: 'CLOUD' },
  { key: 'kaspersky', icon: 'ShieldCheck', href: ROUTES.PRODUCTS_KASPERSKY, code: 'SECURITY' },
  { key: 'esim', icon: 'Wifi', href: ROUTES.PRODUCTS_ESIM, code: 'ESIM' },
] as const

const WHY_US = [
  { key: 'fast', icon: 'Zap' },
  { key: 'transparent', icon: 'Eye' },
  { key: 'payment', icon: 'CreditCard' },
  { key: 'flexible', icon: 'Settings2' },
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

export function HomePage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [featuredTab, setFeaturedTab] = useState<FeaturedTab>('all')
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true)

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
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
    Promise.all([
      contentService.getTestimonials(),
      contentService.getFaqs('general'),
      contentService.getFaqs('billing'),
    ]).then(([testimonialData, generalFaqs, billingFaqs]) => {
      setTestimonials(testimonialData)
      setFaqs([...generalFaqs, ...billingFaqs])
    })
  }, [])

  return (
    <div className="font-plex">
      <Seo title={t('home.hero.title')} description={t('home.hero.subtitle')} />

      {/* ============ 1. HERO — "Signal Sweep" signature ============ */}
      <Hero />

      {/* ============ 2. TRUSTED BY — receives the Hero's signal sweep ============ */}
      <section className="relative overflow-hidden border-b border-home-line bg-home-paper px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,102,179,0.07) 0%, transparent 75%)',
          }}
          aria-hidden
        />
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="sweep-landing-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sweep-landing-left" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={`M${SWEEP_EXIT_X},0 C${SWEEP_EXIT_X},60 820,75 960,76 L1220,76`}
            fill="none"
            stroke="url(#sweep-landing-right)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d={`M${SWEEP_EXIT_X},0 C${SWEEP_EXIT_X},60 620,75 480,76 L220,76`}
            fill="none"
            stroke="url(#sweep-landing-left)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

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

      {/* ============ 3. PRODUCT CATEGORIES — status-board cards ============ */}
      <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <ReadoutHeading
              eyebrow={t('home.categories.eyebrow')}
              title={t('home.categories.title')}
              subtitle={t('home.categories.subtitle')}
              className="mb-14"
            />
          </RevealOnScroll>
          <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <StaggerItem key={category.key}>
                <Link
                  to={category.href}
                  className="group flex h-full flex-col gap-4 border border-home-line bg-white/40 p-7 transition-colors duration-200 hover:border-home-wire/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-md bg-home-ink text-home-wire">
                      <DynamicIcon name={category.icon} className="size-5" />
                    </span>
                    <span className="font-data text-[11px] tracking-[0.1em] text-home-graphite-soft">
                      {category.code}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-home-graphite">
                      {t(`home.categories.${category.key}.name`)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-home-graphite-soft">
                      {t(`home.categories.${category.key}.desc`)}
                    </p>
                    <ul className="mt-4 flex flex-col gap-1.5">
                      {(['b1', 'b2', 'b3'] as const).map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-home-graphite-soft">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-home-wire" />
                          {t(`home.categories.${category.key}.${b}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-home-graphite group-hover:gap-2.5 transition-[gap]">
                    {t('common.learnMore')}
                    <ArrowRight className="size-4 text-home-beacon" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ 4. WHY CHOOSE US ============ */}
      <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <RevealOnScroll direction="left">
            <ReadoutHeading
              align="left"
              eyebrow={t('home.whyUs.eyebrow')}
              title={t('home.whyUs.title')}
              subtitle={t('home.whyUs.subtitle')}
              className="mb-2"
            />
            <Link
              to={ROUTES.ABOUT}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-home-graphite hover:gap-2.5 transition-[gap]"
            >
              {t('common.learnMore')}
              <ArrowRight className="size-4 text-home-beacon" />
            </Link>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1}>
            <StaggerContainer className="grid grid-cols-2 gap-3">
              {WHY_US.map((item) => (
                <StaggerItem key={item.key}>
                  <div className="flex h-full flex-col gap-2.5 border border-home-line border-l-2 border-l-home-wire bg-white/40 p-4">
                    <span className="flex size-8 items-center justify-center rounded-md bg-home-ink text-home-wire">
                      <DynamicIcon name={item.icon} className="size-4" />
                    </span>
                    <p className="font-display text-sm font-semibold text-home-graphite">
                      {t(`home.whyUs.${item.key}.title`)}
                    </p>
                    <p className="line-clamp-2 text-xs leading-5 text-home-graphite-soft">
                      {t(`home.whyUs.${item.key}.desc`)}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>
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
            <div className="border border-home-line bg-home-ink p-4">
              <div className="flex items-center justify-between border-b border-home-paper/10 pb-3">
                <span className="font-data text-[11px] uppercase tracking-[0.12em] text-home-paper/50">
                  cloud-region · uptime
                </span>
                <span className="inline-flex items-center gap-1.5 font-data text-[11px] text-home-wire">
                  <span className="size-1.5 rounded-full bg-home-wire" />
                  ONLINE
                </span>
              </div>
              <CloudInfrastructureVisual className="mt-2 aspect-[620/380] w-full" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 8. KASPERSKY ============ */}
      <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="order-2 border border-home-line bg-home-ink p-4 lg:order-1">
            <div className="flex items-center justify-between border-b border-home-paper/10 pb-3">
              <span className="font-data text-[11px] uppercase tracking-[0.12em] text-home-paper/50">
                endpoint · posture
              </span>
              <span className="inline-flex items-center gap-1.5 font-data text-[11px] text-home-wire">
                <span className="size-1.5 rounded-full bg-home-wire" />
                PROTECTED
              </span>
            </div>
            <SecurityPerimeterVisual className="mt-2 aspect-[620/380] w-full" />
          </div>

          <RevealOnScroll direction="right" delay={0.1} className="order-1 lg:order-2">
            <ReadoutHeading
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
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-home-beacon" />
                    <span className="text-sm text-home-graphite-soft">
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
            <div className="border border-home-line bg-home-ink p-4">
              <div className="flex items-center justify-between border-b border-home-paper/10 pb-3">
                <span className="font-data text-[11px] uppercase tracking-[0.12em] text-home-paper/50">
                  roaming · coverage
                </span>
                <span className="inline-flex items-center gap-1.5 font-data text-[11px] text-home-wire">
                  <span className="size-1.5 rounded-full bg-home-wire" />
                  CONNECTED
                </span>
              </div>
              <EsimConnectionVisual className="mt-2 aspect-[620/380] w-full" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 10. STATS — dark chapter ============ */}
      <section className="relative overflow-hidden bg-home-ink px-4 py-20 text-home-paper sm:px-6 lg:px-8">
        <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <StaggerContainer className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          <StaggerItem>
            <AnimatedCounter value={1500} suffix="+" className="font-display block text-3xl font-semibold sm:text-4xl" />
            <p className="mt-2 font-data text-xs uppercase tracking-[0.1em] text-home-paper/50">{t('home.stats.customers')}</p>
          </StaggerItem>
          <StaggerItem>
            <AnimatedCounter value={35} suffix="+" className="font-display block text-3xl font-semibold sm:text-4xl" />
            <p className="mt-2 font-data text-xs uppercase tracking-[0.1em] text-home-paper/50">{t('home.stats.countries')}</p>
          </StaggerItem>
          <StaggerItem>
            <AnimatedCounter value={99} suffix=".9%" className="font-display block text-3xl font-semibold sm:text-4xl" />
            <p className="mt-2 font-data text-xs uppercase tracking-[0.1em] text-home-paper/50">{t('home.stats.uptime')}</p>
          </StaggerItem>
          <StaggerItem>
            <AnimatedCounter value={24} suffix="/7" className="font-display block text-3xl font-semibold sm:text-4xl" />
            <p className="mt-2 font-data text-xs uppercase tracking-[0.1em] text-home-paper/50">{t('home.stats.supportHours')}</p>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* ============ 11. TESTIMONIALS ============ */}
      {testimonials.length > 0 && (
        <section className="border-b border-home-line bg-home-paper px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <RevealOnScroll>
              <ReadoutHeading eyebrow={t('home.testimonials.eyebrow')} title={t('home.testimonials.title')} className="mb-14" />
            </RevealOnScroll>
            <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((testimonial) => (
                <StaggerItem key={testimonial.id} className="h-full">
                  <div className="flex h-full flex-col gap-4 border border-home-line bg-white/40 p-6">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={cn(
                            'size-3.5',
                            starIdx < testimonial.rating ? 'fill-home-beacon text-home-beacon' : 'text-home-line',
                          )}
                        />
                      ))}
                    </div>
                    <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-home-graphite-soft">
                      &ldquo;{localize(testimonial.content, locale)}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 border-t border-home-line pt-4">
                      <img src={testimonial.avatar} alt={testimonial.name} className="size-9 rounded-full bg-home-paper" />
                      <div>
                        <p className="text-sm font-semibold text-home-graphite">{testimonial.name}</p>
                        <p className="text-xs text-home-graphite-soft">{localize(testimonial.role, locale)}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

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

      {/* ============ 13. FINAL CTA ============ */}
      <section className="relative overflow-hidden bg-home-ink px-4 py-24 text-center text-home-paper sm:px-6 lg:px-8">
        <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <RevealOnScroll className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t('home.cta.title')}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={ROUTES.PRODUCTS}
              className="group inline-flex items-center gap-2 rounded-md bg-home-beacon px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,102,179,0.55)] transition-colors hover:bg-home-beacon/90 focus-ring"
            >
              {t('home.cta.primary')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-md border border-home-paper/20 px-6 py-3 text-sm font-semibold text-home-paper transition-colors hover:border-home-paper/40 hover:bg-home-paper/5 focus-ring"
            >
              {t('home.cta.secondary')}
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  )
}
