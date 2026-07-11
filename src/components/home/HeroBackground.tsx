import { motion, useReducedMotion } from 'framer-motion'

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/**
 * Layered, premium Hero backdrop — soft radial washes, low-opacity blurred
 * blobs, a faint engineering grid, near-invisible noise, and a very slow
 * moving gradient sheen. Purely decorative and non-interactive.
 */
export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Layer 1 — soft radial gradient wash (blue / purple / white) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 16% 18%, rgba(37,99,235,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 50% 45% at 86% 12%, rgba(99,102,241,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 50% 92%, rgba(6,182,212,0.08) 0%, transparent 70%)
          `,
        }}
      />

      {/* Layer 2 — large blurred gradient blobs, very low opacity, slow drift */}
      <div className="animate-float absolute -left-32 -top-24 size-[520px] rounded-full bg-primary/10 blur-[280px]" />
      <div
        className="animate-drift absolute -right-24 top-1/4 size-[480px] rounded-full bg-secondary/10 blur-[260px]"
        style={{ animationDelay: '1.2s' }}
      />
      <div
        className="animate-float absolute bottom-[-12%] left-1/3 size-[460px] rounded-full bg-accent/10 blur-[260px]"
        style={{ animationDelay: '2.4s' }}
      />

      {/* Layer 3 — engineering grid, ~5% opacity, fading via radial mask */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 32%, black 15%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 32%, black 15%, transparent 78%)',
        }}
      />

      {/* Layer 4 — almost invisible noise texture */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{ backgroundImage: NOISE_BG }}
      />

      {/* Layer 5 — subtle, very slow moving gradient sheen */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            background:
              'linear-gradient(120deg, transparent 25%, rgba(37,99,235,0.5) 50%, transparent 75%)',
            backgroundSize: '220% 220%',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  )
}
