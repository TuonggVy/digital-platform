import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ContactCTA } from '@/components/common/ContactCTA'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { ROUTES } from '@/constants/routes'

// Shared exit point: the header's signal curve lands at x=1120 (viewBox width
// 1440) at its bottom edge, and the "who we are" section's connector picks up
// from that same x at its top edge — two independent SVGs reading as one
// continuous line across the section boundary, the same technique used for
// the Homepage Hero → "Trusted by" seam.
const HEADER_SIGNAL_EXIT_X = 1120
const HEADER_SIGNAL_PATH = `M1440,0 C1320,90 1200,140 1160,220 C1130,280 ${HEADER_SIGNAL_EXIT_X},340 ${HEADER_SIGNAL_EXIT_X},400`
const CONNECTOR_PATH = `M${HEADER_SIGNAL_EXIT_X},0 C${HEADER_SIGNAL_EXIT_X},50 1220,64 1300,64 L1440,64`

const PRINCIPLES = [
  { key: 'value1', icon: 'Eye' },
  { key: 'value2', icon: 'Sparkles' },
  { key: 'value3', icon: 'ShieldCheck' },
  { key: 'value4', icon: 'HeartHandshake' },
] as const

const ECOSYSTEM = [
  { key: 'cloud', icon: 'Cloud', href: ROUTES.PRODUCTS_CLOUD, viewAllKey: 'nav.megamenu.viewAllCloud' },
  { key: 'esim', icon: 'Wifi', href: ROUTES.PRODUCTS_ESIM, viewAllKey: 'nav.megamenu.viewAllEsim' },
  { key: 'kaspersky', icon: 'ShieldCheck', href: ROUTES.PRODUCTS_KASPERSKY, viewAllKey: 'nav.megamenu.viewAllKaspersky' },
] as const

export function AboutPage() {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  return (
    <div>
      <Seo title={t('nav.about')} description={t('aboutPage.storyContent')} />

      {/* ============ Compact navy header ============ */}
      <section className="relative overflow-hidden bg-home-ink font-plex">
        <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,102,179,0.14))' }}
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-0 hidden opacity-70 [mask-image:linear-gradient(to_right,transparent,black_45%)] lg:block"
          aria-hidden
        >
          {/* <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="about-header-signal" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
            <motion.path
              d={HEADER_SIGNAL_PATH}
              fill="none"
              stroke="url(#about-header-signal)"
              strokeWidth={2}
              strokeLinecap="round"
              initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg> */}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <RevealOnScroll>
            <Breadcrumb items={[{ label: t('nav.about') }]} tone="dark" />
          </RevealOnScroll>

          <RevealOnScroll delay={0.06} className="mt-6 max-w-2xl">
            <span className="inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em] text-home-wire">
              <span className="size-1.5 rounded-full bg-home-wire" />
              // {t('aboutPage.eyebrow')}
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('aboutPage.headerTitle')}
            </h1>
            <p className="mt-3 text-base leading-7 text-white/60">{t('aboutPage.headerIntro')}</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ Who we are ============ */}
      <section className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8">
        {/* <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="about-connector" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={CONNECTOR_PATH}
            fill="none"
            stroke="url(#about-connector)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg> */}

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <RevealOnScroll direction="left">
            <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {t('aboutPage.storyTitle')}
            </h2>
            <p className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-text-primary sm:text-3xl">
              {t('aboutPage.storyContent')}
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1} direction="right" className="flex flex-col gap-6">
            <img src="/VTC_Logo.png" alt="VTC Telecom" className="h-8 w-auto object-contain" />
            <div className="flex flex-col gap-6 border-t border-border pt-6">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{t('aboutPage.missionTitle')}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{t('aboutPage.missionContent')}</p>
              </div>
              <div className="border-t border-border pt-6">
                <h3 className="text-base font-semibold text-text-primary">{t('aboutPage.visionTitle')}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{t('aboutPage.visionContent')}</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ============ Connected service ecosystem ============ */}
      <section className="border-y border-border bg-surface/40 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t('aboutPage.ecosystemEyebrow')}
              title={t('aboutPage.ecosystemTitle')}
              subtitle={t('aboutPage.ecosystemSubtitle')}
              className="mb-14"
            />
          </RevealOnScroll>

          <StaggerContainer className="relative grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            <div
              className="pointer-events-none absolute inset-x-0 top-[18px] hidden h-px bg-border sm:block"
              aria-hidden
            />
            {ECOSYSTEM.map((item) => (
              <StaggerItem key={item.key}>
                <Link
                  to={item.href}
                  className="group relative flex h-full flex-col gap-4 rounded-lg focus-ring"
                >
                  <span className="relative z-10 flex size-9 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                    <DynamicIcon name={item.icon} className="size-4" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary transition-colors group-hover:text-primary">
                      {t(`home.categories.${item.key}.name`)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {t(`home.categories.${item.key}.desc`)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {t(item.viewAllKey)}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ Principles ============ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionHeading title={t('aboutPage.valuesTitle')} align="left" className="mb-8" />
        </RevealOnScroll>
        <StaggerContainer className="flex flex-col divide-y divide-border border-y border-border">
          {PRINCIPLES.map((principle) => (
            <StaggerItem key={principle.key}>
              <div className="flex items-start gap-5 py-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <DynamicIcon name={principle.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t(`aboutPage.${principle.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                    {t(`aboutPage.${principle.key}.desc`)}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ============ CTA — navy bookend, flows into the (already dark) Footer ============ */}
      {/* <section className="relative overflow-hidden bg-home-ink px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <RevealOnScroll className="relative mx-auto max-w-3xl">
          <ContactCTA
            title={t('aboutPage.ctaTitle')}
            primaryLabel={t('common.seeAll')}
            secondaryLabel={t('common.contactSales')}
            bare
            tone="dark"
          />
        </RevealOnScroll>
      </section> */}
    </div>
  )
}
