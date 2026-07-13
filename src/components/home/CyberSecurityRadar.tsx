import type { ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ShieldCheck, Bug, ShieldAlert, CreditCard, Smartphone, Mail, Flame, Eye, Cloud } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const SWEEP_DURATION = 9
const RING_COLORS = ['#DCE7FF', '#C9D8FF', '#AFC8FF', '#5B7FFF']
const RING_COUNT = 9
const SPOKE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

type Icon = ComponentType<LucideProps>

interface ThreatPoint {
  key: string
  icon: Icon
  /** Degrees clockwise from top (12 o'clock), fixed so layout never shifts between renders. */
  angle: number
  /** Fraction of radar radius, 0 = center, 1 = edge — chosen to spread nodes across different rings. */
  radius: number
}

/** Fixed (non-random) so the radar layout is stable across renders. */
const THREATS: ThreatPoint[] = [
  { key: 'Malware', icon: Bug, angle: 20, radius: 0.88 },
  { key: 'Phishing', icon: ShieldAlert, angle: 65, radius: 0.52 },
  { key: 'Payment', icon: CreditCard, angle: 110, radius: 0.78 },
  { key: 'Device', icon: Smartphone, angle: 155, radius: 0.44 },
  { key: 'Email', icon: Mail, angle: 200, radius: 0.68 },
  { key: 'Firewall', icon: Flame, angle: 245, radius: 0.85 },
  { key: 'Privacy', icon: Eye, angle: 290, radius: 0.58 },
  { key: 'Cloud', icon: Cloud, angle: 335, radius: 0.72 },
]

/** Small radar "blips" — plain glowing dots (no icon) that softly appear and fade. */
const TARGET_DOTS = [
  { angle: 40, radius: 0.3, delay: 0 },
  { angle: 130, radius: 0.62, delay: 1.6, hideOnMobile: true },
  { angle: 210, radius: 0.35, delay: 3.2 },
  { angle: 300, radius: 0.6, delay: 4.8, hideOnMobile: true },
]

/** Fixed decorative particles — deterministic positions/delays, no Math.random. */
const PARTICLES = [
  { top: '8%', left: '14%', delay: 0, hideOnMobile: false },
  { top: '86%', left: '10%', delay: 1.4, hideOnMobile: false },
  { top: '16%', left: '90%', delay: 2.1, hideOnMobile: true },
  { top: '96%', left: '54%', delay: 1.9, hideOnMobile: true },
]

function polarToPercent(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return {
    left: 50 + radius * 47 * Math.sin(rad),
    top: 50 - radius * 47 * Math.cos(rad),
  }
}

/** Time offset (s) at which the linearly-rotating sweep beam crosses this angle. */
function sweepDelay(angle: number) {
  return ((angle % 360) / 360) * SWEEP_DURATION
}

/**
 * Premium animated "cyber security radar" illustration — concentric rings,
 * a slowly rotating cyan sweep, glowing threat-category nodes that flare as
 * the beam passes, and a glowing shield core. Pure CSS + Framer Motion,
 * fully decorative (aria-hidden). Borderless — blends into the page
 * background instead of sitting inside a separate card.
 */
export function CyberSecurityRadar() {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex aspect-square w-full max-w-[480px] items-center justify-center p-3 sm:p-5"
    >
      {/* layer 1 — subtle background radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 46%, rgba(91,127,255,0.14) 0%, transparent 70%)',
        }}
      />

      {/* ambient outer particles — sit in the small margin around the radar */}
      {!reduced &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className={
              p.hideOnMobile
                ? 'pointer-events-none absolute hidden size-1 rounded-full bg-[#5B7FFF]/50 sm:block'
                : 'pointer-events-none absolute size-1 rounded-full bg-[#5B7FFF]/50'
            }
            style={{ top: p.top, left: p.left }}
            animate={{ opacity: [0.15, 0.7, 0.15], y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}

      {/* radar — occupies ~90% of the illustration area, no card/border around it */}
      <div className="relative aspect-square w-[90%] shrink-0 rounded-full">
        {/* layer 2 — concentric rings + radial grid */}
        {Array.from({ length: RING_COUNT }, (_, i) => {
          const r = (i + 1) / RING_COUNT
          return (
            <span
              key={i}
              className="absolute rounded-full border"
              style={{
                inset: `${(1 - r) * 50}%`,
                borderColor: RING_COLORS[i % RING_COLORS.length],
                opacity: 0.14 + (i / RING_COUNT) * 0.22,
              }}
            />
          )
        })}

        {/* outer ring — very subtle, occasional pulse */}
        {!reduced && (
          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: RING_COLORS[RING_COLORS.length - 1] }}
            animate={{ opacity: [0.16, 0.16, 0.5, 0.16, 0.16], scale: [1, 1, 1.012, 1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.42, 0.5, 0.58, 1] }}
          />
        )}

        {SPOKE_ANGLES.map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 h-1/2 w-px bg-gradient-to-b from-[#AFC8FF]/50 to-transparent"
            style={{ transformOrigin: 'top', transform: `translateX(-50%) rotate(${deg}deg)` }}
          />
        ))}

        {/* layer 3 — rotating sweep beam, clipped to the circle, sits behind nodes/shield */}
        {!reduced && (
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: SWEEP_DURATION, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="absolute inset-0 rounded-full blur-sm sm:blur-md"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 320deg, rgba(56,189,248,0.04) 326deg, rgba(56,189,248,0.22) 344deg, rgba(34,211,238,0.55) 358deg, transparent 360deg)',
                }}
              />
            </div>
          </motion.div>
        )}

        {/* layer 4 — small target dots that softly appear and fade */}
        {!reduced &&
          TARGET_DOTS.map((dot, i) => {
            const { left, top } = polarToPercent(dot.angle, dot.radius)
            return (
              <motion.span
                key={i}
                className={
                  dot.hideOnMobile
                    ? 'absolute hidden size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70 shadow-[0_0_6px_rgba(34,211,238,0.6)] sm:block'
                    : 'absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70 shadow-[0_0_6px_rgba(34,211,238,0.6)]'
                }
                style={{ left: `${left}%`, top: `${top}%` }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.1, 0.5] }}
                transition={{ duration: 3.2, repeat: Infinity, delay: dot.delay, ease: 'easeInOut' }}
              />
            )
          })}

        {/* layer 5 — circular security nodes, pulsing + flaring as the sweep passes */}
        {THREATS.map((threat) => {
          const { left, top } = polarToPercent(threat.angle, threat.radius)
          const delay = sweepDelay(threat.angle)
          const ThreatIcon = threat.icon
          return (
            <motion.div
              key={threat.key}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
              animate={
                reduced
                  ? undefined
                  : { y: [0, -3, 0], scale: [1, 1.28, 1, 1], opacity: [0.6, 1, 0.6, 0.6] }
              }
              transition={{
                duration: SWEEP_DURATION,
                repeat: Infinity,
                delay,
                times: [0, 0.06, 0.4, 1],
                ease: 'easeInOut',
              }}
            >
              <span className="absolute -inset-2 rounded-full bg-accent/30 blur-md" />
              <span className="relative flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-white shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                <ThreatIcon className="size-3" strokeWidth={2} />
              </span>
            </motion.div>
          )
        })}

        {/* layer 6 — central shield card, with a slow breathing glow behind it */}
        <motion.div
          className="absolute inset-0 m-auto size-[38%] rounded-full bg-[#5B7FFF]/25 blur-2xl"
          animate={reduced ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.14, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 m-auto flex size-[24%] items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C9CFF] to-primary-dark shadow-[0_20px_45px_-12px_rgba(37,99,235,0.55)]">
          <ShieldCheck className="size-[48%] text-white" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}