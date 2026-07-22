import { motion } from 'framer-motion'

/**
 * Shared timing so Cloud/eSIM/Security read as one family: same easing curve
 * used by RevealOnScroll/StaggerContainer/CoverageMap, same viewport trigger.
 * Each illustration still hand-times its own sequence via per-element delays.
 */
export const VISUAL_EASE = [0.22, 1, 0.36, 1] as const
export const VISUAL_VIEWPORT = { once: true, margin: '-80px' } as const

export const VISUAL_COLOR = {
  stable: 'var(--home-beacon)',
  active: 'var(--home-wire)',
} as const

interface SignalPathProps {
  d: string
  kind?: 'stable' | 'active'
  strokeWidth?: number
  delay?: number
  duration?: number
  reduced: boolean
  className?: string
}

/** A single-draw signal line — the one primitive every illustration's traces/routes/perimeter share. */
export function SignalPath({
  d,
  kind = 'stable',
  strokeWidth = 1.5,
  delay = 0,
  duration = 1,
  reduced,
  className,
}: SignalPathProps) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={VISUAL_COLOR[kind]}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={className}
      initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: kind === 'active' ? 0.9 : 0.7 }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration, delay, ease: VISUAL_EASE }}
    />
  )
}

interface VisualNodeProps {
  cx: number
  cy: number
  r?: number
  shape?: 'circle' | 'square'
  kind?: 'stable' | 'active'
  delay?: number
  reduced: boolean
  /** Draws a faint outer ring — used for anchor/core points, not ordinary nodes. */
  ring?: boolean
}

/**
 * A node marker (device, waypoint, module anchor…) that fades and grows in once.
 * Animates real SVG geometry (r, or x/y/width/height) rather than `scale`, so there's
 * no SVG transform-origin fragility to reason about.
 */
export function VisualNode({
  cx,
  cy,
  r = 5,
  shape = 'circle',
  kind = 'stable',
  delay = 0,
  reduced,
  ring = false,
}: VisualNodeProps) {
  const color = VISUAL_COLOR[kind]
  const entrance = {
    initial: reduced ? undefined : { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: VISUAL_VIEWPORT,
    transition: { duration: 0.4, delay, ease: VISUAL_EASE },
  }

  return (
    <motion.g {...entrance}>
      {ring && (
        <circle cx={cx} cy={cy} r={r * 2.2} fill="none" stroke={color} strokeWidth={1} opacity={0.35} />
      )}
      {shape === 'circle' ? (
        <motion.circle
          cx={cx}
          cy={cy}
          fill={color}
          initial={reduced ? undefined : { r: 0 }}
          whileInView={{ r }}
          viewport={VISUAL_VIEWPORT}
          transition={{ duration: 0.4, delay, ease: VISUAL_EASE }}
        />
      ) : (
        <rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          rx={r * 0.35}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
      )}
    </motion.g>
  )
}
