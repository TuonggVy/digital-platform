import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { SignalPath, VISUAL_COLOR, VISUAL_EASE, VISUAL_VIEWPORT } from './visualPrimitives'

interface ProductVisualProps {
  variant?: 'full' | 'compact'
  className?: string
}

interface Point {
  x: number
  y: number
}

interface CubicSegment {
  p0: Point
  p1: Point
  p2: Point
  p3: Point
}

function cubicPoint(seg: CubicSegment, t: number): Point {
  const mt = 1 - t
  const a = mt * mt * mt
  const b = 3 * mt * mt * t
  const c = 3 * mt * t * t
  const d = t * t * t
  return {
    x: a * seg.p0.x + b * seg.p1.x + c * seg.p2.x + d * seg.p3.x,
    y: a * seg.p0.y + b * seg.p1.y + c * seg.p2.y + d * seg.p3.y,
  }
}

/** Renders the chained cubic segments as one `d` string — the single source of truth for the route's shape. */
function segmentsToPath(segments: CubicSegment[]) {
  let d = `M${segments[0].p0.x},${segments[0].p0.y}`
  for (const seg of segments) {
    d += ` C${seg.p1.x},${seg.p1.y} ${seg.p2.x},${seg.p2.y} ${seg.p3.x},${seg.p3.y}`
  }
  return d
}

/** Samples points along the same segments so the traveling packet rides exactly on the visible line. */
function samplePath(segments: CubicSegment[], samplesPerSegment: number) {
  const points: Point[] = []
  segments.forEach((seg, segIdx) => {
    const start = segIdx === 0 ? 0 : 1
    for (let i = start; i <= samplesPerSegment; i++) {
      points.push(cubicPoint(seg, i / samplesPerSegment))
    }
  })
  return points
}

function polarPoint(cx: number, cy: number, r: number, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

interface LandmassSpec {
  cx: number
  cy: number
  rx: number
  ry: number
  step: number
  maxOpacity: number
}

interface MapDot extends Point {
  opacity: number
}

/** Fills an ellipse with a jittered dot grid, opacity falling off from center to edge —
 *  an organic "landmass" silhouette rather than a rigid rectangular scatter. */
function landmassDots(spec: LandmassSpec): MapDot[] {
  const { cx, cy, rx, ry, step, maxOpacity } = spec
  const dots: MapDot[] = []
  for (let y = cy - ry; y <= cy + ry; y += step) {
    for (let x = cx - rx; x <= cx + rx; x += step) {
      const nx = (x - cx) / rx
      const ny = (y - cy) / ry
      const d = Math.sqrt(nx * nx + ny * ny)
      if (d > 1) continue
      const jitterX = Math.sin((x + y) * 0.6) * (step * 0.2)
      const jitterY = Math.cos((x - y) * 0.5) * (step * 0.2)
      dots.push({ x: x + jitterX, y: y + jitterY, opacity: maxOpacity * (1 - d * 0.65) })
    }
  }
  return dots
}

// Three abstract landmasses (west / central / east) forming a dot-matrix world map — a
// suggestion of geography, not a real one. Opacity fades from each landmass's core to its
// edge so the silhouette reads as organic rather than a grid.
const WEST_LANDMASS: LandmassSpec = { cx: 115, cy: 260, rx: 85, ry: 95, step: 20, maxOpacity: 0.32 }
const CENTRAL_LANDMASS: LandmassSpec = { cx: 305, cy: 185, rx: 55, ry: 65, step: 20, maxOpacity: 0.26 }
const EAST_LANDMASS: LandmassSpec = { cx: 505, cy: 130, rx: 95, ry: 90, step: 20, maxOpacity: 0.32 }

// Compact renders inside a wrapper already at 50% opacity with a left-fade mask, and at a
// much smaller physical size than the full variant, so it uses fewer, larger, higher-contrast
// dots (see the dotRadius passed to LandmassField below) rather than the full variant's finer field.
const WEST_LANDMASS_COMPACT: LandmassSpec = { cx: 130, cy: 385, rx: 42, ry: 48, step: 15, maxOpacity: 0.75 }
const EAST_LANDMASS_COMPACT: LandmassSpec = { cx: 335, cy: 125, rx: 48, ry: 55, step: 15, maxOpacity: 0.75 }

// A handful of static, inactive coverage points — texture only. They never animate or pulse;
// only the route's destination is ever shown as "active," so this can't read as a coverage
// claim for any specific place.
const COVERAGE_NODES_FULL: Point[] = [
  { x: 150, y: 320 },
  { x: 330, y: 230 },
  { x: 480, y: 200 },
]

/** The abstract dot-matrix map context — a quiet background layer, never the visual focus. */
function LandmassField({ dots, reduced, dotRadius = 1.75 }: { dots: MapDot[]; reduced: boolean; dotRadius?: number }) {
  return (
    <motion.g
      initial={reduced ? undefined : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration: 0.5, ease: VISUAL_EASE }}
    >
      {dots.map((dot, idx) => (
        <circle key={idx} cx={dot.x} cy={dot.y} r={dotRadius} fill={VISUAL_COLOR.stable} opacity={dot.opacity} />
      ))}
    </motion.g>
  )
}

/** Static, non-animating coverage texture — deliberately quieter than the destination. */
function CoverageNodes({ points, reduced }: { points: Point[]; reduced: boolean }) {
  return (
    <motion.g
      initial={reduced ? undefined : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration: 0.4, delay: 0.15, ease: VISUAL_EASE }}
    >
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r={2.75} fill={VISUAL_COLOR.stable} opacity={0.42} />
      ))}
    </motion.g>
  )
}

/** Device with a small eSIM chip glyph, anchored into the map rather than floating in empty space. */
function DeviceGlyph({ x, y, reduced }: { x: number; y: number; reduced: boolean }) {
  return (
    <motion.g
      initial={reduced ? undefined : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration: 0.4, delay: 0.15, ease: VISUAL_EASE }}
    >
      <rect x={x - 11} y={y - 19} width={22} height={38} rx={5.5} fill="none" stroke={VISUAL_COLOR.stable} strokeWidth={1.75} />
      <rect x={x - 6} y={y + 1} width={12} height={9} rx={1.5} fill="none" stroke={VISUAL_COLOR.stable} strokeWidth={1.25} />
      <path
        d={`M${x - 6},${y + 4} H${x + 6} M${x - 6},${y + 6.5} H${x + 6}`}
        stroke={VISUAL_COLOR.stable}
        strokeWidth={0.9}
        opacity={0.7}
      />
      <motion.circle
        cx={x}
        cy={y - 12}
        fill={VISUAL_COLOR.active}
        initial={reduced ? undefined : { r: 0 }}
        whileInView={{ r: 2.25 }}
        viewport={VISUAL_VIEWPORT}
        transition={{ duration: 0.3, delay: 0.3, ease: VISUAL_EASE }}
      />
    </motion.g>
  )
}

function Waypoint({
  cx,
  cy,
  delay,
  reduced,
  hideOnMobile,
}: {
  cx: number
  cy: number
  delay: number
  reduced: boolean
  hideOnMobile?: boolean
}) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      fill={VISUAL_COLOR.stable}
      className={hideOnMobile ? 'hidden sm:block' : undefined}
      initial={reduced ? undefined : { r: 0, opacity: 0 }}
      whileInView={{ r: 3.5, opacity: 1 }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration: 0.3, delay, ease: VISUAL_EASE }}
    />
  )
}

/** One data packet, traveling the route once — omitted entirely under reduced motion. */
function TravelingPacket({
  points,
  delay,
  duration,
  reduced,
}: {
  points: Point[]
  delay: number
  duration: number
  reduced: boolean
}) {
  if (reduced) return null
  // Same keyframe count as cx/cy (one entry per sampled point) so opacity's implicit
  // timing stays in sync with position: fade in immediately, hold, fade out at arrival.
  const opacityKeyframes = [0, ...Array(points.length - 2).fill(1), 0]
  return (
    <motion.circle
      r={2.75}
      fill={VISUAL_COLOR.active}
      initial={{ opacity: 0 }}
      whileInView={{
        cx: points.map((p) => p.x),
        cy: points.map((p) => p.y),
        opacity: opacityKeyframes,
      }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration, delay, ease: 'easeInOut' }}
    />
  )
}

/** Destination node — connects (stable → active) as the packet arrives, then one restrained ring pulse. */
function Destination({
  cx,
  cy,
  delay,
  reduced,
  pulse,
}: {
  cx: number
  cy: number
  delay: number
  reduced: boolean
  pulse: boolean
}) {
  return (
    <>
      <circle cx={cx} cy={cy} r={12} fill="none" stroke={VISUAL_COLOR.active} strokeWidth={1} opacity={0.3} />
      <motion.circle
        cx={cx}
        cy={cy}
        initial={reduced ? undefined : { r: 0, fill: VISUAL_COLOR.stable }}
        whileInView={{ r: 7, fill: VISUAL_COLOR.active }}
        viewport={VISUAL_VIEWPORT}
        transition={{ duration: 0.5, delay, ease: VISUAL_EASE }}
      />
      {pulse && !reduced && (
        <motion.circle
          cx={cx}
          cy={cy}
          fill="none"
          stroke={VISUAL_COLOR.active}
          strokeWidth={1.5}
          initial={{ r: 7, opacity: 0.6 }}
          whileInView={{ r: 20, opacity: 0 }}
          viewport={VISUAL_VIEWPORT}
          transition={{ duration: 0.9, delay: delay + 0.15, ease: 'easeOut' }}
        />
      )}
    </>
  )
}

/** A small quarter-arc broadcast mark beside the destination — reads as "connected," not a generic target ring. */
function SignalWave({ cx, cy, delay, reduced }: { cx: number; cy: number; delay: number; reduced: boolean }) {
  const arc = (r: number) => {
    const start = polarPoint(cx, cy, r, -75)
    const end = polarPoint(cx, cy, r, -15)
    return `M${start.x.toFixed(1)},${start.y.toFixed(1)} A${r},${r} 0 0,1 ${end.x.toFixed(1)},${end.y.toFixed(1)}`
  }
  return (
    <motion.g
      initial={reduced ? undefined : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration: 0.35, delay, ease: VISUAL_EASE }}
    >
      <path d={arc(15)} fill="none" stroke={VISUAL_COLOR.active} strokeWidth={1.25} opacity={0.6} strokeLinecap="round" />
      <path d={arc(20)} fill="none" stroke={VISUAL_COLOR.active} strokeWidth={1.25} opacity={0.35} strokeLinecap="round" />
    </motion.g>
  )
}

export function EsimRouteMapVisual({ variant = 'full', className }: ProductVisualProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  if (variant === 'compact') {
    const device = { x: 130, y: 380 }
    const waypoint = { cx: 220, cy: 255 }
    const destination = { cx: 330, cy: 130 }
    const segments: CubicSegment[] = [
      { p0: { x: 140, y: 362 }, p1: { x: 175, y: 320 }, p2: { x: 195, y: 285 }, p3: { x: 220, y: 255 } },
      { p0: { x: 220, y: 255 }, p1: { x: 250, y: 220 }, p2: { x: 288, y: 175 }, p3: { x: 330, y: 130 } },
    ]
    const routeDelay = 0.3
    const routeDuration = 0.9
    const packetDelay = routeDelay + routeDuration
    const packetDuration = 0.55
    const packetPoints = samplePath(segments, 5)
    const destinationDelay = packetDelay + packetDuration
    const mapDots = [...landmassDots(WEST_LANDMASS_COMPACT), ...landmassDots(EAST_LANDMASS_COMPACT)]

    return (
      <div className={cn('relative', className)} aria-hidden="true">
        <svg viewBox="0 0 420 460" className="h-full w-full overflow-visible" focusable="false">
          <LandmassField dots={mapDots} reduced={reduced} dotRadius={2.4} />

          <DeviceGlyph x={device.x} y={device.y} reduced={reduced} />
          <SignalPath d={segmentsToPath(segments)} kind="active" delay={routeDelay} duration={routeDuration} reduced={reduced} />

          <Waypoint cx={waypoint.cx} cy={waypoint.cy} delay={routeDelay + routeDuration * 0.5} reduced={reduced} />

          <TravelingPacket points={packetPoints} delay={packetDelay} duration={packetDuration} reduced={reduced} />
          <Destination cx={destination.cx} cy={destination.cy} delay={destinationDelay} reduced={reduced} pulse={false} />
        </svg>
      </div>
    )
  }

  const device = { x: 110, y: 290 }
  const waypoint1 = { cx: 300, cy: 190 }
  const waypoint2 = { cx: 430, cy: 110 }
  const destination = { cx: 540, cy: 150 }
  const segments: CubicSegment[] = [
    { p0: { x: 120, y: 282 }, p1: { x: 200, y: 255 }, p2: { x: 250, y: 220 }, p3: { x: 300, y: 190 } },
    { p0: { x: 300, y: 190 }, p1: { x: 360, y: 155 }, p2: { x: 390, y: 130 }, p3: { x: 430, y: 110 } },
    { p0: { x: 430, y: 110 }, p1: { x: 470, y: 95 }, p2: { x: 500, y: 110 }, p3: { x: 540, y: 150 } },
  ]
  const routeDelay = 0.35
  const routeDuration = 1.1
  const packetDelay = routeDelay + routeDuration
  const packetDuration = 0.7
  const packetPoints = samplePath(segments, 4)
  const destinationDelay = packetDelay + packetDuration
  const mapDots = [...landmassDots(WEST_LANDMASS), ...landmassDots(CENTRAL_LANDMASS), ...landmassDots(EAST_LANDMASS)]

  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <svg viewBox="0 0 620 380" className="h-full w-full overflow-visible" focusable="false">
        <LandmassField dots={mapDots} reduced={reduced} />
        <CoverageNodes points={COVERAGE_NODES_FULL} reduced={reduced} />

        <DeviceGlyph x={device.x} y={device.y} reduced={reduced} />
        <SignalPath d={segmentsToPath(segments)} kind="active" delay={routeDelay} duration={routeDuration} reduced={reduced} />

        <Waypoint cx={waypoint1.cx} cy={waypoint1.cy} delay={routeDelay + routeDuration * 0.4} reduced={reduced} />
        <Waypoint
          cx={waypoint2.cx}
          cy={waypoint2.cy}
          delay={routeDelay + routeDuration * 0.75}
          reduced={reduced}
          hideOnMobile
        />

        <TravelingPacket points={packetPoints} delay={packetDelay} duration={packetDuration} reduced={reduced} />
        <Destination cx={destination.cx} cy={destination.cy} delay={destinationDelay} reduced={reduced} pulse />
        <SignalWave cx={destination.cx} cy={destination.cy} delay={destinationDelay + 0.2} reduced={reduced} />
      </svg>
    </div>
  )
}
