import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { AnimatedCounter } from '@/components/animation/AnimatedCounter'
import { CoverageMap } from './CoverageMap'
import { HeroBackground } from './HeroBackground'
import { ROUTES } from '@/constants/routes'

const TRUST_STATS = [
  { value: 1500, suffix: '+', labelKey: 'home.stats.customers' },
  { value: 35, suffix: '+', labelKey: 'home.stats.countries' },
  { value: 99, suffix: '.9%', labelKey: 'home.stats.uptime' },
  { value: 24, suffix: '/7', labelKey: 'home.stats.supportHours' },
] as const

export function Hero() {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.4])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-home-ink font-plex text-home-paper">
      <HeroBackground />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[minmax(0,480px)_1fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-36">
        <motion.div style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}>
          <RevealOnScroll direction="scale">
            <span className="inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em] text-home-wire">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-home-wire" />
                {!reduced && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-home-wire"
                    animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </span>
              VTC TELECOM // MẠNG LƯỚI SỐ
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={0.08}>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-home-paper sm:text-5xl lg:text-[3.4rem]">
              {t('home.hero.title')}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-home-paper/65">
              {t('home.hero.subtitle')}
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.16}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={ROUTES.PRODUCTS}
                className="group relative isolate inline-flex items-center gap-2 overflow-hidden rounded-md bg-home-beacon px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,102,179,0.55)] transition-colors hover:bg-home-beacon/90 focus-ring"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-20 z-0 w-16 -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[1px] transition-[left] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:left-full motion-reduce:hidden"
                />
                <span className="relative z-10 inline-flex items-center gap-2">
                  {t('home.hero.ctaPrimary')}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <Link
                to={ROUTES.CONTACT}
                className="inline-flex items-center gap-2 rounded-md border border-home-paper/20 px-6 py-3 text-sm font-semibold text-home-paper transition-colors hover:border-home-paper/40 hover:bg-home-paper/5 focus-ring"
              >
                {t('home.hero.ctaSecondary')}
              </Link>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.26}>
            <div className="mt-14 border-t border-home-paper/10 pt-6">
              <p className="font-data text-[11px] uppercase tracking-[0.14em] text-home-paper/40">
                {t('home.hero.trustedBy')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {TRUST_STATS.map((stat) => (
                  <div key={stat.labelKey}>
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      className="font-data text-xl font-medium text-home-paper"
                    />
                    <p className="mt-1 text-xs text-home-paper/50">{t(stat.labelKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </motion.div>

        <motion.div
          className="relative -mx-4 mt-4 aspect-[620/470] w-[calc(100%+2rem)] opacity-70 sm:-mx-6 sm:w-[calc(100%+3rem)] lg:mx-0 lg:mt-0 lg:w-full lg:opacity-80"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div
            className="pointer-events-none absolute inset-0 lg:[mask-image:linear-gradient(to_right,transparent,black_18%)]"
            aria-hidden
          >
            <CoverageMap variant="hero" tone="dark" className="h-full w-full" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="relative mx-auto hidden max-w-7xl items-center gap-1.5 px-4 pb-8 text-home-paper/40 sm:px-6 lg:flex lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduced ? 0.5 : [0.25, 0.6, 0.25] }}
        transition={{ duration: 2.4, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="size-3.5" />
        <span className="font-data text-[11px] uppercase tracking-[0.14em]">
          {t('home.hero.scrollHint')}
        </span>
      </motion.div>
    </section>
  )
}
