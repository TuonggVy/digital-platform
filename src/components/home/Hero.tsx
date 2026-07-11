import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { AnimatedCounter } from '@/components/animation/AnimatedCounter'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { WaveDivider } from '@/components/common/WaveDivider'
import { HeroBackground } from './HeroBackground'
import { HeroDashboard } from './HeroDashboard'
import { ROUTES } from '@/constants/routes'

const TRUST_STATS = [
  { value: 1500, suffix: '+', labelKey: 'home.stats.customers', icon: 'Users' },
  { value: 35, suffix: '+', labelKey: 'home.stats.countries', icon: 'Globe' },
  { value: 99, suffix: '.9%', labelKey: 'home.stats.uptime', icon: 'Gauge' },
  { value: 24, suffix: '/7', labelKey: 'home.stats.supportHours', icon: 'Headphones' },
] as const

function TrustStat({ value, suffix, labelKey, icon, t }: (typeof TRUST_STATS)[number] & { t: (k: string) => string }) {
  return (
    <div className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border/60 bg-surface/50 px-3 py-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-surface/70 hover:shadow-lg hover:shadow-primary/10">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
        <DynamicIcon name={icon} className="size-4" />
      </span>
      <AnimatedCounter
        value={value}
        suffix={suffix}
        className="text-lg font-bold text-text-primary sm:text-xl"
      />
      <p className="text-center text-xs text-text-secondary">{t(labelKey)}</p>
    </div>
  )
}

/**
 * Premium SaaS Hero — layered animated background and a large interactive
 * dashboard mockup that emerges on scroll. Copy (badge, heading, subtitle,
 * CTAs, stats) is unchanged from the original Hero.
 */
export function Hero() {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.35])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background">
      <HeroBackground />

      {/* Intro zone — fills most of the first viewport so the dashboard below
          the fold reveals itself as the user scrolls, instead of appearing
          instantly on load. */}
      <div className="relative z-10 flex min-h-[88vh] flex-col items-center justify-center px-4 pb-12 pt-28 sm:px-6 lg:min-h-screen lg:px-8 lg:pt-32">
        <motion.div
          style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
          className="mx-auto max-w-[900px] text-center"
        >
          <RevealOnScroll direction="scale">
            <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              VTC TELECOM
            </span>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              {t('home.hero.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-text-secondary">
              {t('home.hero.subtitle')}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={ROUTES.PRODUCTS}>
                <Button
                  size="lg"
                  className="group shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35"
                  rightIcon={
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  }
                >
                  {t('home.hero.ctaPrimary')}
                </Button>
              </Link>
              <Link to={ROUTES.CONTACT}>
                <Button
                  size="lg"
                  variant="outline"
                  className="!border-border/70 !bg-surface/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:!bg-surface/85 hover:shadow-md"
                >
                  {t('home.hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.3}>
            <div className="mx-auto mt-14 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary/70">
                {t('home.hero.trustedBy')}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TRUST_STATS.map((stat) => (
                  <TrustStat key={stat.labelKey} {...stat} t={t} />
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col items-center gap-1.5 text-text-secondary/60 lg:absolute lg:bottom-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: reduced ? 0.6 : [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.2, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[11px] font-medium uppercase tracking-widest">
            {t('home.hero.scrollHint')}
          </span>
          <ChevronDown className="size-4" />
        </motion.div>
      </div>

      <div className="relative px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <HeroDashboard />
      </div>

      <WaveDivider fillClassName="fill-background" />
    </section>
  )
}
