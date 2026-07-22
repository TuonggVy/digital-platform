import { motion, useReducedMotion } from 'framer-motion'

/**
 * The curved sweep is authored so its exit tangent at the bottom edge is
 * perfectly vertical (control point shares the endpoint's x). The "Trusted
 * by" section's connector path (HomePage.tsx) starts with the same vertical
 * tangent at the same x — both use a 1440-wide viewBox with
 * preserveAspectRatio="none", so the two independent SVGs read as one
 * continuous line across the section boundary at any viewport width.
 */
export const SWEEP_EXIT_X = 720

const SWEEP_PATH = `M1300,30 C1120,170 1180,330 900,390 C660,440 ${SWEEP_EXIT_X},780 ${SWEEP_EXIT_X},900`

export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="bg-grid-home-dark absolute inset-0 opacity-60" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 82% 8%, rgba(0,174,239,0.14) 0%, transparent 65%), radial-gradient(ellipse 55% 45% at 6% 85%, rgba(0,102,179,0.16) 0%, transparent 70%)',
        }}
      />

      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="sweep-gradient" x1="100%" y1="0%" x2="10%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>

        <motion.path
          d={SWEEP_PATH}
          fill="none"
          stroke="url(#sweep-gradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {!reduced && (
          <motion.path
            d={SWEEP_PATH}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="18 900"
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{ strokeDashoffset: -920, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              repeatDelay: 2.2,
              delay: 1.8,
              ease: 'easeInOut',
            }}
          />
        )}
      </svg>
    </div>
  )
}
