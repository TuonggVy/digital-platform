import { motion, useReducedMotion } from 'framer-motion'

const CURVE_LEFT = 'M0,260 C160,180 220,340 380,260 C480,210 520,120 600,140'
const CURVE_RIGHT = 'M600,140 C520,120 480,210 380,260 C220,340 160,180 0,260'

/**
 * Full-viewport backdrop for the auth pages — a faint dot-grid plus two
 * quiet signal curves anchored to the bottom corners. Draws in once on
 * mount, no looping motion, no glow.
 */
export function DecorativeBackground() {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="bg-grid-home-dark absolute inset-0 opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,102,179,0.10) 0%, transparent 70%)',
        }}
      />

      <svg
        viewBox="0 0 600 400"
        className="absolute -bottom-10 -left-16 h-[280px] w-[420px] opacity-40 sm:h-[340px] sm:w-[520px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="auth-bg-left" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <motion.path
          d={CURVE_LEFT}
          fill="none"
          stroke="url(#auth-bg-left)"
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      <svg
        viewBox="0 0 600 400"
        className="absolute -bottom-10 -right-16 h-[280px] w-[420px] opacity-40 sm:h-[340px] sm:w-[520px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="auth-bg-right" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <motion.path
          d={CURVE_RIGHT}
          fill="none"
          stroke="url(#auth-bg-right)"
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  )
}
