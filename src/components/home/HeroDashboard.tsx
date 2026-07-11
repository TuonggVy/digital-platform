import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Server, ShieldCheck, Smartphone, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

const TONE_CLASSES: Record<'emerald' | 'primary' | 'accent', string> = {
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600',
  primary: 'border-primary/25 bg-primary/10 text-primary',
  accent: 'border-accent/25 bg-accent/10 text-accent',
}

const DOT_CLASSES: Record<'emerald' | 'primary' | 'accent', string> = {
  emerald: 'bg-emerald-500',
  primary: 'bg-primary',
  accent: 'bg-accent',
}

function DashboardModule({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Server
  children: ReactNode
}) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-background/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
      <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
          <Icon className="size-4" />
        </span>
        {title}
      </p>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  )
}

function ProgressRow({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-text-secondary">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: '0%' }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs text-text-secondary">{value}%</span>
    </div>
  )
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-secondary">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  )
}

function MiniLineChart() {
  return (
    <svg viewBox="0 0 240 64" className="mt-3 h-16 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="hero-dash-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
        <linearGradient id="hero-dash-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,54 L0,48 C20,40 40,52 60,34 C80,18 100,30 120,20 C140,10 160,24 180,14 C200,6 220,18 240,8 L240,54 Z"
        fill="url(#hero-dash-area)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.path
        d="M0,48 C20,40 40,52 60,34 C80,18 100,30 120,20 C140,10 160,24 180,14 C200,6 220,18 240,8"
        fill="none"
        stroke="url(#hero-dash-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.3, ease: 'easeOut' }}
      />
    </svg>
  )
}

/**
 * Large glass "control center" dashboard mockup — entirely built with React
 * and Tailwind (no screenshots). Emerges on scroll with a scale + fade
 * transition reminiscent of Apple product pages. All copy is localized via
 * i18next (home.hero.dashboard.*).
 */
export function HeroDashboard() {
  const { t } = useTranslation()

  const cloudRows = [
    { label: t('home.hero.dashboard.cloud.cpu'), value: 68 },
    { label: t('home.hero.dashboard.cloud.storage'), value: 45 },
    { label: t('home.hero.dashboard.cloud.bandwidth'), value: 82 },
  ]

  const securityRows = [
    { label: t('home.hero.dashboard.security.threatProtection'), status: t('home.hero.dashboard.security.active') },
    { label: t('home.hero.dashboard.security.firewall'), status: t('home.hero.dashboard.security.enabled') },
    { label: t('home.hero.dashboard.security.monitoring'), status: t('home.hero.dashboard.security.live') },
  ]

  const esimRows = [
    { label: t('home.hero.dashboard.esim.countries'), value: t('home.hero.dashboard.esim.countriesValue') },
    { label: t('home.hero.dashboard.esim.activation'), value: t('home.hero.dashboard.esim.activationValue') },
    { label: t('home.hero.dashboard.esim.qrStatus'), value: t('home.hero.dashboard.esim.qrValue') },
  ]

  const activities = [
    { icon: Server, text: t('home.hero.dashboard.activity.item1'), time: t('home.hero.dashboard.activity.time1') },
    { icon: ShieldCheck, text: t('home.hero.dashboard.activity.item2'), time: t('home.hero.dashboard.activity.time2') },
    { icon: Smartphone, text: t('home.hero.dashboard.activity.item3'), time: t('home.hero.dashboard.activity.time3') },
  ]

  const statusBadges = [
    { label: t('home.hero.dashboard.status.running'), tone: 'emerald' as const },
    { label: t('home.hero.dashboard.status.protected'), tone: 'primary' as const },
    { label: t('home.hero.dashboard.status.healthy'), tone: 'accent' as const },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto w-full max-w-5xl"
    >
      <div className="rounded-[32px] border border-border/60 bg-surface/70 p-4 shadow-2xl shadow-primary/10 backdrop-blur-2xl sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              <span className="size-2.5 rounded-full bg-amber-400/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="text-sm font-medium text-text-secondary">
              {t('home.hero.dashboard.label')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusBadges.map((badge) => (
              <span
                key={badge.label}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  TONE_CLASSES[badge.tone],
                )}
              >
                <span className={cn('size-1.5 rounded-full', DOT_CLASSES[badge.tone])} />
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardModule title={t('home.hero.dashboard.cloud.title')} icon={Server}>
            {cloudRows.map((row, idx) => (
              <ProgressRow key={row.label} label={row.label} value={row.value} delay={idx * 0.1} />
            ))}
          </DashboardModule>

          <DashboardModule title={t('home.hero.dashboard.security.title')} icon={ShieldCheck}>
            {securityRows.map((row) => (
              <StatusRow key={row.label} label={row.label} status={row.status} />
            ))}
          </DashboardModule>

          <DashboardModule title={t('home.hero.dashboard.esim.title')} icon={Smartphone}>
            {esimRows.map((row) => (
              <MiniStat key={row.label} label={row.label} value={row.value} />
            ))}
          </DashboardModule>
        </div>

        <div className="mt-4 hidden gap-4 sm:grid sm:grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
          <div className="group rounded-2xl border border-border/60 bg-background/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">
                {t('home.hero.dashboard.throughput.title')}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="size-3.5" />
                {t('home.hero.dashboard.throughput.change')}
              </span>
            </div>
            <MiniLineChart />
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
            <p className="text-sm font-semibold text-text-primary">
              {t('home.hero.dashboard.activity.title')}
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {activities.map((activity) => (
                <li key={activity.text} className="flex items-center gap-2.5 text-sm">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <activity.icon className="size-3.5" />
                  </span>
                  <span className="flex-1 text-text-secondary">{activity.text}</span>
                  <span className="shrink-0 text-xs text-text-secondary/70">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
