import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
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

/** Piecewise-linear interpolation across an arbitrary number of keyframes, clamped at the ends —
 *  the numeric equivalent of `useTransform`'s array overload, used inside `useTransform`'s
 *  function form so the amplitude can be scaled per-frame by refs (prefers-reduced-motion,
 *  mobile) without fighting framer-motion's range-memoization on the array overload. */
function lerpRange(value: number, input: number[], output: number[]): number {
  const clamped = Math.min(Math.max(value, input[0]), input[input.length - 1])
  for (let i = 0; i < input.length - 1; i++) {
    if (clamped <= input[i + 1]) {
      const span = input[i + 1] - input[i] || 1
      const t = (clamped - input[i]) / span
      return output[i] + t * (output[i + 1] - output[i])
    }
  }
  return output[output.length - 1]
}

function useIsDesktop(breakpointPx = 1024) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= breakpointPx,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`)
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpointPx])

  return isDesktop
}

/** One text+image beat of the Product Story chapter. Renders fully transparent — the shared
 *  sticky background (`ProductStoryChapter`) shows through — and drives its own scroll-linked
 *  parallax independent from the chapter's background layers, so text/image/grid/glow each move
 *  at a different speed relative to the page. Mobile always keeps text before image in source
 *  order (`imagePosition` only reorders columns from `lg:` up); reduced motion and sub-1024px
 *  viewports scale amplitude down via refs read inside the `useTransform` callbacks. */
function ProductStoryPanel({
  children,
  image,
  imagePosition,
}: {
  children: ReactNode
  image: ReactNode
  imagePosition: 'left' | 'right'
}) {
  const panelRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()

  const reducedRef = useRef(prefersReducedMotion)
  const desktopRef = useRef(isDesktop)
  useEffect(() => {
    reducedRef.current = prefersReducedMotion
    desktopRef.current = isDesktop
  }, [prefersReducedMotion, isDesktop])

  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 34,
    mass: 0.2,
    restDelta: 0.001,
  })

  const textY = useTransform(smoothProgress, (p) => {
    if (reducedRef.current) return 0
    const amplitude = desktopRef.current ? 1 : 0.35
    return lerpRange(p, [0, 0.5, 1], [54, 0, -54]) * amplitude
  })
  const textOpacity = useTransform(smoothProgress, (p) =>
    reducedRef.current ? 1 : lerpRange(p, [0, 0.16, 0.82, 1], [0, 1, 1, 0]),
  )

  const imageY = useTransform(smoothProgress, (p) => {
    if (reducedRef.current) return 0
    const amplitude = desktopRef.current ? 1 : 0.35
    return lerpRange(p, [0, 0.5, 1], [86, 0, -72]) * amplitude
  })
  const imageScale = useTransform(smoothProgress, (p) =>
    reducedRef.current ? 1 : lerpRange(p, [0, 0.42, 0.72, 1], [0.92, 1, 1, 0.95]),
  )
  const imageOpacity = useTransform(smoothProgress, (p) =>
    reducedRef.current ? 1 : lerpRange(p, [0, 0.14, 0.84, 1], [0, 1, 1, 0]),
  )

  const isImageRight = imagePosition === 'right'

  return (
    <section
      ref={panelRef}
      className="relative flex min-h-[85svh] items-center px-4 py-20 sm:px-6 lg:min-h-[100svh] lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className={cn(
            'transform-gpu [backface-visibility:hidden] [will-change:transform,opacity]',
            !isImageRight && 'lg:order-2',
          )}
        >
          {children}
        </motion.div>
        <motion.div
          style={{ y: imageY, scale: imageScale, opacity: imageOpacity }}
          className={cn(
            'transform-gpu [backface-visibility:hidden] [will-change:transform,opacity]',
            !isImageRight && 'lg:order-1',
          )}
        >
          {image}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-[8%] bottom-0 h-px bg-white/5" aria-hidden />
    </section>
  )
}

/** Cloud / Kaspersky / eSIM as one continuous scroll-linked story instead of three independently
 *  colored sections: a sticky dark background (grid + two ambient glows + vignette) stays pinned
 *  behind three real, natively-scrolling `ProductStoryPanel`s via the "sticky box + `-mt-[100svh]`
 *  content overlap" trick — the sticky div occupies 100svh of layout height, and the immediately
 *  following content wrapper cancels that with a negative top margin so the panels start at the
 *  same scroll offset instead of leaving a blank viewport above them. `scrollYProgress` here only
 *  drives the shared background (grid/glow drift slower and opposite the content for depth); each
 *  panel owns its own independent progress for its text/image parallax. Pure `useScroll`/native
 *  scroll — no wheel listener, no `preventDefault`, no snap, nothing pins the user in place. */
function ProductStoryChapter() {
  const { t } = useTranslation()
  const storyRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()

  const reducedRef = useRef(prefersReducedMotion)
  const desktopRef = useRef(isDesktop)
  useEffect(() => {
    reducedRef.current = prefersReducedMotion
    desktopRef.current = isDesktop
  }, [prefersReducedMotion, isDesktop])

  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 32,
    mass: 0.25,
    restDelta: 0.001,
  })

  const amplitude = () => (reducedRef.current ? 0 : desktopRef.current ? 1 : 0.5)

  const gridY = useTransform(smoothProgress, (p) => `${lerpRange(p, [0, 1], [-6, 8]) * amplitude()}%`)
  const gridX = useTransform(
    smoothProgress,
    (p) => `${lerpRange(p, [0, 0.5, 1], [-2, 2, -1]) * amplitude()}%`,
  )
  const gridScale = useTransform(smoothProgress, (p) => {
    const base = lerpRange(p, [0, 0.5, 1], [1.04, 1.09, 1.05])
    return 1 + (base - 1) * amplitude()
  })

  const primaryGlowX = useTransform(
    smoothProgress,
    (p) => `${lerpRange(p, [0, 0.5, 1], [-18, 18, -8]) * amplitude()}%`,
  )
  const primaryGlowY = useTransform(
    smoothProgress,
    (p) => `${lerpRange(p, [0, 0.5, 1], [-8, 16, 30]) * amplitude()}%`,
  )
  const primaryGlowScale = useTransform(smoothProgress, (p) => {
    const base = lerpRange(p, [0, 0.5, 1], [0.9, 1.15, 1])
    return 1 + (base - 1) * amplitude()
  })

  const secondaryGlowX = useTransform(smoothProgress, (p) => `${lerpRange(p, [0, 1], [24, -18]) * amplitude()}%`)
  const secondaryGlowY = useTransform(smoothProgress, (p) => `${lerpRange(p, [0, 1], [20, -10]) * amplitude()}%`)

  return (
    <section ref={storyRef} className="relative isolate bg-home-ink text-home-paper">
      <div className="pointer-events-none sticky top-0 z-0 h-[100svh] overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[#050713]" />

        <motion.div
          className="absolute -inset-[12%] transform-gpu [will-change:transform]"
          style={{
            x: gridX,
            y: gridY,
            scale: gridScale,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: 'clamp(72px, 8vw, 132px) clamp(72px, 8vw, 132px)',
          }}
        />

        <motion.div
          className="absolute left-[18%] top-[15%] h-[62vw] max-h-[820px] w-[62vw] max-w-[820px] rounded-full bg-[radial-gradient(circle,rgba(0,174,239,0.18)_0%,rgba(37,99,235,0.12)_36%,transparent_70%)] blur-3xl transform-gpu [will-change:transform]"
          style={{ x: primaryGlowX, y: primaryGlowY, scale: primaryGlowScale }}
        />

        <motion.div
          className="absolute bottom-[10%] right-[12%] h-[46vw] max-h-[620px] w-[46vw] max-w-[620px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.12)_0%,rgba(0,174,239,0.08)_40%,transparent_72%)] blur-3xl transform-gpu [will-change:transform]"
          style={{ x: secondaryGlowX, y: secondaryGlowY }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_28%,rgba(2,6,18,0.68)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-home-ink/20 via-transparent to-home-ink/55" />
      </div>

      <div className="relative z-10 -mt-[100svh]">
        <ProductStoryPanel
          imagePosition="right"
          image={
            <ServiceProductVisual
              src="/images/home/cloud-service-3d-transparent.webp"
              alt="Biểu tượng hạ tầng điện toán đám mây với hệ thống máy chủ"
              imageClassName="max-h-[380px] drop-shadow-[0_30px_30px_rgba(0,174,239,0.14)] sm:max-h-[440px] lg:max-h-[500px]"
            />
          }
        >
          <ReadoutHeading
            dark
            align="left"
            eyebrow={t('home.cloudSection.eyebrow')}
            title={t('home.cloudSection.title')}
            subtitle={t('home.cloudSection.subtitle')}
            className="mb-8"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CLOUD_FEATURES.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-sm"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-home-wire/25 bg-home-paper/[0.04] text-home-wire">
                  <DynamicIcon name={feature.icon} className="size-4" />
                </span>
                <p className="text-sm text-home-paper/65">{t(`home.cloudSection.${feature.key}`)}</p>
              </div>
            ))}
          </div>
        </ProductStoryPanel>

        <ProductStoryPanel
          imagePosition="left"
          image={
            <ServiceProductVisual
              src="/images/home/kaspersky-security-3d-transparent.webp"
              alt="Biểu tượng khiên bảo mật cho dịch vụ Kaspersky"
              imageClassName="max-h-[320px] drop-shadow-[0_30px_32px_rgba(0,174,239,0.12)] sm:max-h-[380px] lg:max-h-[440px]"
            />
          }
        >
          <ReadoutHeading
            dark
            align="left"
            eyebrow={t('home.kasperskySection.eyebrow')}
            title={t('home.kasperskySection.title')}
            subtitle={t('home.kasperskySection.subtitle')}
            className="mb-8"
          />
          <div className="flex flex-col gap-3">
            {KASPERSKY_FEATURES.map((feature) => (
              <div key={feature.key} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-home-wire" />
                <span className="text-sm text-home-paper/65">{t(`home.kasperskySection.${feature.key}`)}</span>
              </div>
            ))}
          </div>
        </ProductStoryPanel>

        <ProductStoryPanel
          imagePosition="right"
          image={
            <ServiceProductVisual
              src="/images/home/esim-service-3d-transparent.webp"
              alt="Biểu tượng thẻ eSIM kỹ thuật số"
              imageClassName="max-h-[320px] drop-shadow-[0_30px_30px_rgba(0,174,239,0.12)] sm:max-h-[380px] lg:max-h-[440px]"
            />
          }
        >
          <ReadoutHeading
            dark
            align="left"
            eyebrow={t('home.esimSection.eyebrow')}
            title={t('home.esimSection.title')}
            subtitle={t('home.esimSection.subtitle')}
            className="mb-8"
          />
          <div className="flex flex-col gap-3">
            {ESIM_FEATURES.map((feature) => (
              <div key={feature.key} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-home-wire" />
                <span className="text-sm text-home-paper/65">{t(`home.esimSection.${feature.key}`)}</span>
              </div>
            ))}
          </div>
        </ProductStoryPanel>
      </div>
    </section>
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

      {/* ============ 7-9. PRODUCT STORY — Cloud / Kaspersky / eSIM as one scroll-linked chapter ============ */}
      <ProductStoryChapter />

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
