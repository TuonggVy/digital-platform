import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Star, CheckCircle2 } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ContactCTA } from '@/components/common/ContactCTA'
import { Accordion } from '@/components/common/Accordion'
import { Tabs } from '@/components/common/Tabs'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { Marquee } from '@/components/common/Marquee'
import { WaveDivider } from '@/components/common/WaveDivider'
import { ProductGrid } from '@/components/product/ProductGrid'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { AnimatedCounter } from '@/components/animation/AnimatedCounter'
import { Hero } from '@/components/home/Hero'
import { CyberSecurityRadar } from '@/components/home/CyberSecurityRadar'
import { productService } from '@/services/productService'
import { contentService } from '@/services/contentService'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { ROUTES } from '@/constants/routes'
import { mockPartners } from '@/data/mocks/partners'
import type { Faq, Product, Testimonial } from '@/types'

const CATEGORIES = [
  { key: 'cloud', icon: 'Cloud', href: ROUTES.PRODUCTS_CLOUD },
  { key: 'kaspersky', icon: 'ShieldCheck', href: ROUTES.PRODUCTS_KASPERSKY },
  { key: 'esim', icon: 'Wifi', href: ROUTES.PRODUCTS_ESIM },
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

export function HomePage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const prefersReducedMotion = useReducedMotion()

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
    <div>
      <Seo title={t('home.hero.title')} description={t('home.hero.subtitle')} />

      {/* ============ 1. HERO — premium SaaS hero with dashboard + floating cards ============ */}
      <Hero />

      {/* ============ 2. TRUSTED BY — premium badge + gradient heading + logo marquee ============ */}
      <section className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-3xl" />
          <div className="absolute -left-32 top-20 size-72 rounded-full bg-primary/[0.06] blur-3xl" />
          <div className="absolute -right-32 top-10 size-72 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="absolute inset-0 bg-grid opacity-[0.02]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <RevealOnScroll>
              <h2 className="max-w-4xl text-balance text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                {t('home.partners.titlePrefix')}{' '}
                <span className="text-primary">{t('home.partners.titleHighlight')}</span>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll delay={0.08}>
              <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                {t('home.partners.description')}
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.16} direction="scale">
              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30 sm:w-24" />
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30 sm:w-24" />
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.22} className="mt-10 sm:mt-12">
            <Marquee
              gapClassName="gap-x-14 sm:gap-x-20 lg:gap-x-24"
              items={mockPartners}
              getKey={(partner) => partner.id}
              renderItem={(partner) => (
                <span className="whitespace-nowrap text-2xl font-semibold tracking-tight text-text-secondary/50 grayscale transition-all duration-300 ease-out hover:scale-105 hover:text-text-primary hover:grayscale-0 sm:text-3xl lg:text-[2rem]">
                  {partner.name}
                </span>
              )}
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 3. PRODUCT CATEGORIES — light gray, blurred blob, lifting cards ============ */}
      <section className="relative overflow-hidden bg-surface px-4 py-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t('home.categories.eyebrow')}
              title={t('home.categories.title')}
              subtitle={t('home.categories.subtitle')}
              className="mb-16"
            />
          </RevealOnScroll>
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <StaggerItem key={category.key}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-background p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <DynamicIcon name={category.icon} className="size-7" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {t(`home.categories.${category.key}.name`)}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      {t(`home.categories.${category.key}.desc`)}
                    </p>
                    <ul className="mt-4 flex flex-col gap-1.5">
                      {(['b1', 'b2', 'b3'] as const).map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          {t(`home.categories.${category.key}.${b}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    to={category.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                  >
                    {t('common.learnMore')}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ 4. WHY CHOOSE US — white, text left / dashboard mockup right ============ */}
      <section className="relative overflow-hidden bg-background px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <RevealOnScroll direction="left">
            <SectionHeading
              align="left"
              eyebrow={t('home.whyUs.eyebrow')}
              title={t('home.whyUs.title')}
              subtitle={t('home.whyUs.subtitle')}
              className="mb-2"
            />
            <Link
              to={ROUTES.ABOUT}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
            >
              {t('common.learnMore')}
              <ArrowRight className="size-4" />
            </Link>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="relative">
            <div className="pointer-events-none absolute -right-10 -top-10 -z-10 size-72 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative rounded-3xl border border-border bg-surface/70 p-3 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <StaggerContainer className="grid grid-cols-2 gap-3 p-2 pb-3">
                {WHY_US.map((item) => (
                  <StaggerItem key={item.key}>
                    <div className="flex h-full flex-col gap-2.5 rounded-2xl bg-background p-4 shadow-sm">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <DynamicIcon name={item.icon} className="size-[18px]" />
                      </span>
                      <p className="text-sm font-semibold text-text-primary">
                        {t(`home.whyUs.${item.key}.title`)}
                      </p>
                      <p className="line-clamp-2 text-xs text-text-secondary">
                        {t(`home.whyUs.${item.key}.desc`)}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 5. FEATURED PRODUCTS — soft gradient, floating tabs, elevated card panel ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.04] via-background to-background px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t('home.featured.eyebrow')}
              title={t('home.featured.title')}
              subtitle={t('home.featured.subtitle')}
              className="mb-10"
            />
          </RevealOnScroll>
          <RevealOnScroll delay={0.05} direction="scale" className="flex justify-center">
            <div className="inline-flex rounded-2xl bg-background p-2 shadow-lg shadow-primary/10">
              <Tabs
                value={featuredTab}
                onChange={(v) => setFeaturedTab(v as FeaturedTab)}
                tabs={[
                  { value: 'all', label: t('home.tabs.all') },
                  { value: 'cloud', label: t('home.tabs.cloud') },
                  { value: 'kaspersky', label: t('home.tabs.kaspersky') },
                  { value: 'esim', label: t('home.tabs.esim') },
                ]}
              />
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <div className="mt-12 rounded-3xl bg-background p-6 shadow-2xl shadow-primary/[0.07] sm:p-10">
              <ProductGrid products={featuredProducts} isLoading={isFeaturedLoading} />
            </div>
          </RevealOnScroll>
        </div>

        <WaveDivider fillClassName="fill-[#070c18]" />
      </section>

      {/* ============ 6. PURCHASE PROCESS — dark chapter, animated timeline, glow nodes ============ */}
      <section className="relative overflow-hidden bg-[#070c18] px-4 py-28 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#070c18] from-0% via-[#0a1630] via-38% to-[#070c18] to-75%" />

          <div className="absolute left-1/2 top-20 h-[420px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.20)_0%,rgba(34,211,238,0.08)_38%,transparent_72%)] blur-2xl" />

          <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <RevealOnScroll>
            <SectionHeading
              light
              eyebrow={t('home.process.eyebrow')}
              title={t('home.process.title')}
              className="mb-20"
            />
          </RevealOnScroll>
          <div className="relative flex flex-col gap-12">
            {prefersReducedMotion ? (
              <div className="absolute left-6 top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-primary via-accent to-transparent sm:left-8" />
            ) : (
              <motion.div
                className="absolute left-6 top-2 w-px origin-top bg-gradient-to-b from-primary via-accent to-transparent sm:left-8"
                style={{ height: 'calc(100% - 16px)' }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {PROCESS_STEPS.map((step, idx) => (
              <RevealOnScroll key={step.key} delay={idx * 0.12}>
                <div className="relative flex items-start gap-6 sm:gap-8">
                  <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_30px_-2px_rgba(37,99,235,0.7)] sm:size-16">
                    <DynamicIcon name={step.icon} className="size-5 sm:size-6" />
                  </span>
                  <div className="pt-1 sm:pt-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                      0{idx + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                      {t(`home.process.${step.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {t(`home.process.${step.key}.desc`)}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. CLOUD SECTION — soft gradient, glass dashboard mockup ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] via-accent/[0.05] to-background px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <RevealOnScroll direction="left">
            <SectionHeading
              align="left"
              eyebrow={t('home.cloudSection.eyebrow')}
              title={t('home.cloudSection.title')}
              subtitle={t('home.cloudSection.subtitle')}
              className="mb-8"
            />
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CLOUD_FEATURES.map((feature) => (
                <StaggerItem key={feature.key}>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/70 p-4 shadow-sm">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DynamicIcon name={feature.icon} className="size-5" />
                    </span>
                    <p className="text-sm text-text-secondary">
                      {t(`home.cloudSection.${feature.key}`)}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1} direction="right">
            <div className="rounded-3xl border border-border bg-surface/70 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-amber-400/70" />
                  <span className="size-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="text-xs text-text-secondary">cloud-server-01</span>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                {[72, 45, 88, 60].map((value, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs text-text-secondary">CPU {idx + 1}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs text-text-secondary">
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 8. KASPERSKY — white, illustration left / text right ============ */}
      <section className="relative overflow-hidden bg-background px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <RevealOnScroll direction="left" className="relative order-2 lg:order-1">
            <div className="pointer-events-none absolute -left-10 top-1/2 -z-10 size-72 -translate-y-1/2 rounded-full bg-secondary/15 blur-3xl" />
            <CyberSecurityRadar />
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow={t('home.kasperskySection.eyebrow')}
              title={t('home.kasperskySection.title')}
              subtitle={t('home.kasperskySection.subtitle')}
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-4">
              {KASPERSKY_FEATURES.map((feature) => (
                <StaggerItem key={feature.key}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                      <CheckCircle2 className="size-4" />
                    </span>
                    <span className="text-sm text-text-secondary">
                      {t(`home.kasperskySection.${feature.key}`)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 9. eSIM — blue gradient, phone mockup + floating QR, diagonal accent ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] via-accent/[0.05] to-background px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <RevealOnScroll direction="left">
            <SectionHeading
              align="left"
              eyebrow={t('home.esimSection.eyebrow')}
              title={t('home.esimSection.title')}
              subtitle={t('home.esimSection.subtitle')}
              className="mb-8"
            />
            <StaggerContainer className="flex flex-col gap-4">
              {ESIM_FEATURES.map((feature) => (
                <StaggerItem key={feature.key}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <CheckCircle2 className="size-4" />
                    </span>
                    <span className="text-sm text-text-secondary">
                      {t(`home.esimSection.${feature.key}`)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="relative flex justify-center">
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
              <div className="size-80 -rotate-6 rounded-[3rem] bg-gradient-to-br from-primary/10 to-accent/10" />
            </div>
            <div className="relative w-64 rounded-[2.5rem] border-8 border-background bg-surface shadow-2xl shadow-primary/10">
              <div className="mx-auto h-6 w-24 rounded-b-2xl bg-background" />
              <div className="flex flex-col gap-3 px-5 py-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  eSIM VTC
                </p>
                {ESIM_FEATURES.slice(0, 3).map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center gap-2 rounded-xl bg-background p-3 shadow-sm"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <DynamicIcon name={feature.icon} className="size-4" />
                    </span>
                    <span className="text-xs font-medium text-text-primary">
                      {t(`home.esimSection.${feature.key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="animate-float absolute -bottom-6 -right-2 flex size-20 items-center justify-center rounded-2xl border border-border bg-background shadow-xl sm:-right-6"
              style={{ animationDelay: '0.5s' }}
            >
              <DynamicIcon name="QrCode" className="size-10 text-text-primary" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ 10. STATS — full-width gradient banner, animated counters ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-grid opacity-10" />
        <StaggerContainer className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          <StaggerItem>
            <div>
              <AnimatedCounter
                value={1500}
                suffix="+"
                className="text-3xl font-bold text-white sm:text-4xl"
              />
              <p className="mt-2 text-sm text-white/80">{t('home.stats.customers')}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div>
              <AnimatedCounter
                value={35}
                suffix="+"
                className="text-3xl font-bold text-white sm:text-4xl"
              />
              <p className="mt-2 text-sm text-white/80">{t('home.stats.countries')}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div>
              <AnimatedCounter
                value={99}
                suffix=".9%"
                className="text-3xl font-bold text-white sm:text-4xl"
              />
              <p className="mt-2 text-sm text-white/80">{t('home.stats.uptime')}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div>
              <AnimatedCounter
                value={24}
                suffix="/7"
                className="text-3xl font-bold text-white sm:text-4xl"
              />
              <p className="mt-2 text-sm text-white/80">{t('home.stats.supportHours')}</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* ============ 11. TESTIMONIALS — equal-height glass cards over blurred backdrop ============ */}
      {testimonials.length > 0 && (
        <section className="relative overflow-hidden bg-surface px-4 py-28 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-10 size-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <RevealOnScroll>
              <SectionHeading
                eyebrow={t('home.testimonials.eyebrow')}
                title={t('home.testimonials.title')}
                className="mb-16"
              />
            </RevealOnScroll>
            <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((testimonial) => (
                <StaggerItem key={testimonial.id} className="h-full">
                  <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-primary/5 backdrop-blur-md">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`size-3.5 ${starIdx < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                        />
                      ))}
                    </div>
                    <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-text-secondary">
                      &ldquo;{localize(testimonial.content, locale)}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="size-10 rounded-full bg-surface"
                      />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {localize(testimonial.role, locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ============ 12. FAQ — centered, white, generous whitespace ============ */}
      {faqs.length > 0 && (
        <section className="bg-background px-4 py-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <RevealOnScroll>
              <SectionHeading
                eyebrow={t('home.faq.eyebrow')}
                title={t('home.faq.title')}
                className="mb-14"
              />
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

      {/* ============ 13. FINAL CTA — rounded card, glow button ============ */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-secondary to-accent px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-grid opacity-10" />
          <RevealOnScroll direction="scale" className="mx-auto max-w-4xl">
            <ContactCTA
              bare
              glow
              title={t('home.cta.title')}
              primaryLabel={t('home.cta.primary')}
              secondaryLabel={t('home.cta.secondary')}
            />
          </RevealOnScroll>
        </div>
      </section>
    </div>
  )
}
