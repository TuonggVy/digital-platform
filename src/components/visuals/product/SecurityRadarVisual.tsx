import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { SignalPath, VisualNode, VISUAL_COLOR, VISUAL_EASE, VISUAL_VIEWPORT } from './visualPrimitives'

interface ProductVisualProps {
  variant?: 'full' | 'compact'
  className?: string
}

const SWEEP_HALF_ANGLE = 27.5 // ~55° wedge
const SWEEP_DURATION = 8 // seconds per revolution — within the requested 7-9s range

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** A closed circle expressed as two arcs, so it can go through SignalPath's pathLength draw-in. */
function circlePath(cx: number, cy: number, r: number) {
  return `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} Z`
}

/** Rest-state wedge pointing along angle 0, rooted exactly at (cx, cy) — the pivot for its rotation. */
function wedgePath(cx: number, cy: number, r: number) {
  const start = polar(cx, cy, r, -SWEEP_HALF_ANGLE)
  const end = polar(cx, cy, r, SWEEP_HALF_ANGLE)
  return `M${cx},${cy} L${start.x.toFixed(1)},${start.y.toFixed(1)} A${r},${r} 0 0,1 ${end.x.toFixed(1)},${end.y.toFixed(1)} Z`
}

interface RadarGeometry {
  cx: number
  cy: number
  outerR: number
  innerR: number
  coreR: number
}

/**
 * The one continuous animation in this illustration — a soft gradient wedge rotating around the center.
 *
 * This rotates via native SVG `<animateTransform>` rather than Framer Motion's `rotate`/CSS
 * `transform-origin`. A CSS transform-origin on an SVG `<g>` is, by default, resolved relative to
 * that group's own bounding box (`transform-box: fill-box`) — and the wedge's bounding box is
 * asymmetric (it spans from the center out to one edge of the ring, not a square centered on the
 * pivot), so a CSS pixel offset like `310px 190px` was being measured from the wedge's own bounding
 * box corner, not the SVG's viewBox origin, and the wedge orbited around the wrong point.
 * `animateTransform`'s rotation center is always expressed in the SVG's user-space coordinates
 * (the same units as `viewBox`/`d`/`cx`/`cy`), so it is unambiguous and unaffected by responsive scaling.
 */
function SweepArc({ geo, reduced, gradientId }: { geo: RadarGeometry; reduced: boolean; gradientId: string }) {
  return (
    <path d={wedgePath(geo.cx, geo.cy, geo.outerR)} fill={`url(#${gradientId})`}>
      {!reduced && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${geo.cx} ${geo.cy}`}
          to={`360 ${geo.cx} ${geo.cy}`}
          dur={`${SWEEP_DURATION}s`}
          repeatCount="indefinite"
        />
      )}
    </path>
  )
}

function RadarRings({ geo, reduced }: { geo: RadarGeometry; reduced: boolean }) {
  return (
    <>
      <SignalPath d={circlePath(geo.cx, geo.cy, geo.outerR)} kind="stable" strokeWidth={1.75} duration={1.2} reduced={reduced} />
      <motion.path
        d={circlePath(geo.cx, geo.cy, geo.innerR)}
        fill="none"
        stroke={VISUAL_COLOR.stable}
        strokeWidth={1.25}
        initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.32 }}
        viewport={VISUAL_VIEWPORT}
        transition={{ duration: 1.1, delay: 0.15, ease: VISUAL_EASE }}
      />
    </>
  )
}

/** One-time: a signal approaches from outside the field and is absorbed right at the perimeter — never repeats. */
function ContainedSignal({ geo, reduced }: { geo: RadarGeometry; reduced: boolean }) {
  const contact = polar(geo.cx, geo.cy, geo.outerR, -60)
  const origin = polar(geo.cx, geo.cy, geo.outerR + 70, -60)
  const delay = 1.6

  return (
    <g className="hidden md:block">
      <SignalPath
        d={`M${origin.x.toFixed(1)},${origin.y.toFixed(1)} L${contact.x.toFixed(1)},${contact.y.toFixed(1)}`}
        kind="active"
        delay={delay}
        duration={0.7}
        reduced={reduced}
      />
      <circle cx={contact.x} cy={contact.y} r={8} fill="none" stroke={VISUAL_COLOR.stable} strokeWidth={1} opacity={0.3} />
      <motion.circle
        cx={contact.x}
        cy={contact.y}
        initial={reduced ? undefined : { r: 0, fill: VISUAL_COLOR.active }}
        whileInView={{ r: 4, fill: VISUAL_COLOR.stable }}
        viewport={VISUAL_VIEWPORT}
        transition={{ duration: 0.45, delay: delay + 0.7, ease: VISUAL_EASE }}
      />
    </g>
  )
}

export function SecurityRadarVisual({ variant = 'full', className }: ProductVisualProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  if (variant === 'compact') {
    const geo: RadarGeometry = { cx: 240, cy: 210, outerR: 110, innerR: 70, coreR: 5 }
    const devices = [
      { cx: 302, cy: 148, delay: 1.1 },
      { cx: 178, cy: 272, delay: 1.25 },
    ]

    return (
      <div className={cn('relative', className)} aria-hidden="true">
        <svg viewBox="0 0 480 420" className="h-full w-full overflow-visible" focusable="false">
          <defs>
            <linearGradient
              id="radar-sweep-compact"
              gradientUnits="userSpaceOnUse"
              x1={polar(geo.cx, geo.cy, geo.outerR, -SWEEP_HALF_ANGLE).x}
              y1={polar(geo.cx, geo.cy, geo.outerR, -SWEEP_HALF_ANGLE).y}
              x2={polar(geo.cx, geo.cy, geo.outerR, SWEEP_HALF_ANGLE).x}
              y2={polar(geo.cx, geo.cy, geo.outerR, SWEEP_HALF_ANGLE).y}
            >
              <stop offset="0%" stopColor={VISUAL_COLOR.active} stopOpacity={0} />
              <stop offset="100%" stopColor={VISUAL_COLOR.active} stopOpacity={0.45} />
            </linearGradient>
          </defs>

          <SweepArc geo={geo} reduced={reduced} gradientId="radar-sweep-compact" />
          <RadarRings geo={geo} reduced={reduced} />
          <VisualNode cx={geo.cx} cy={geo.cy} r={geo.coreR} kind="stable" ring reduced={reduced} />
          {devices.map((d) => (
            <VisualNode key={d.cx} cx={d.cx} cy={d.cy} r={5} shape="circle" kind="stable" delay={d.delay} reduced={reduced} />
          ))}
        </svg>
      </div>
    )
  }

  const geo: RadarGeometry = { cx: 310, cy: 190, outerR: 150, innerR: 95, coreR: 6 }
  const devices = [
    { cx: 395, cy: 105, delay: 1.1, hideOnMobile: false },
    { cx: 225, cy: 105, delay: 1.22, hideOnMobile: true },
    { cx: 225, cy: 275, delay: 1.34, hideOnMobile: false },
    { cx: 395, cy: 275, delay: 1.46, hideOnMobile: true },
  ]

  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <svg viewBox="0 0 620 380" className="h-full w-full overflow-visible" focusable="false">
        <defs>
          <linearGradient
            id="radar-sweep-full"
            gradientUnits="userSpaceOnUse"
            x1={polar(geo.cx, geo.cy, geo.outerR, -SWEEP_HALF_ANGLE).x}
            y1={polar(geo.cx, geo.cy, geo.outerR, -SWEEP_HALF_ANGLE).y}
            x2={polar(geo.cx, geo.cy, geo.outerR, SWEEP_HALF_ANGLE).x}
            y2={polar(geo.cx, geo.cy, geo.outerR, SWEEP_HALF_ANGLE).y}
          >
            <stop offset="0%" stopColor={VISUAL_COLOR.active} stopOpacity={0} />
            <stop offset="100%" stopColor={VISUAL_COLOR.active} stopOpacity={0.5} />
          </linearGradient>
        </defs>

        <SweepArc geo={geo} reduced={reduced} gradientId="radar-sweep-full" />
        <RadarRings geo={geo} reduced={reduced} />
        <VisualNode cx={geo.cx} cy={geo.cy} r={geo.coreR} kind="stable" ring reduced={reduced} />

        {devices.map((d, idx) => (
          <g key={idx} className={d.hideOnMobile ? 'hidden sm:block' : undefined}>
            <VisualNode cx={d.cx} cy={d.cy} r={6} shape="circle" kind="stable" delay={d.delay} reduced={reduced} />
          </g>
        ))}

        {/* <ContainedSignal geo={geo} reduced={reduced} /> */}
      </svg>
    </div>
  )
}
