import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { SignalPath, VISUAL_COLOR, VISUAL_EASE, VISUAL_VIEWPORT } from './visualPrimitives'

type ModuleKind = 'compute' | 'kubernetes' | 'storage' | 'network'

interface ModuleSpec {
  kind: ModuleKind
  cx: number
  cy: number
  delay: number
}

/** Small, abstract, non-literal glyph per module — pictograms, not dashboard iconography. */
function ModuleGlyph({ kind }: { kind: ModuleKind }) {
  const color = VISUAL_COLOR.stable
  switch (kind) {
    case 'compute':
      return (
        <g stroke={color} strokeWidth={1.5} strokeLinecap="round">
          <path d="M-6,5 V-2" />
          <path d="M0,5 V-6" />
          <path d="M6,5 V-1" />
        </g>
      )
    case 'kubernetes':
      return (
        <path
          d="M0,-8 L7,-4 L7,4 L0,8 L-7,4 L-7,-4 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      )
    case 'storage':
      return (
        <g fill="none" stroke={color} strokeWidth={1.5}>
          <ellipse cx={0} cy={-3} rx={7} ry={2.5} />
          <path d="M-7,-3 V3 C-7,4.4 -3.9,5.5 0,5.5 C3.9,5.5 7,4.4 7,3 V-3" />
        </g>
      )
    case 'network':
      return (
        <g fill={color} stroke={color} strokeWidth={1}>
          <circle cx={-6} cy={4} r={1.6} />
          <circle cx={6} cy={4} r={1.6} />
          <circle cx={0} cy={-5} r={1.6} />
          <path d="M-6,4 L0,-5 L6,4" fill="none" strokeWidth={1.1} />
        </g>
      )
    default:
      return null
  }
}

function Module({ spec, size, reduced }: { spec: ModuleSpec; size: number; reduced: boolean }) {
  const half = size / 2
  return (
    <motion.g
      initial={reduced ? undefined : { opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration: 0.45, delay: spec.delay, ease: VISUAL_EASE }}
    >
      <rect
        x={spec.cx - half}
        y={spec.cy - half}
        width={size}
        height={size}
        rx={size * 0.22}
        fill="none"
        stroke={VISUAL_COLOR.stable}
        strokeWidth={1.5}
      />
      <g transform={`translate(${spec.cx}, ${spec.cy})`}>
        <ModuleGlyph kind={spec.kind} />
      </g>
    </motion.g>
  )
}

/** One right-angle trace from the core to a module, bending once at `bendX`. */
function trace(coreEdgeX: number, coreY: number, bendX: number, moduleEdgeX: number, moduleY: number) {
  return `M${coreEdgeX},${coreY} H${bendX} V${moduleY} H${moduleEdgeX}`
}

/** A single cyan pulse traveling the first trace once — the "active deployment" beat. */
function DeploymentPulse({
  path,
  delay,
  reduced,
}: {
  path: { cx: number[]; cy: number[] }
  delay: number
  reduced: boolean
}) {
  if (reduced) return null
  return (
    <motion.circle
      r={3}
      fill={VISUAL_COLOR.active}
      initial={{ opacity: 0 }}
      whileInView={{ cx: path.cx, cy: path.cy, opacity: [0, 1, 1, 0] }}
      viewport={VISUAL_VIEWPORT}
      transition={{ duration: 0.9, delay, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }}
    />
  )
}

interface ProductVisualProps {
  variant?: 'full' | 'compact'
  className?: string
}

export function CloudProductVisual({ variant = 'full', className }: ProductVisualProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  if (variant === 'compact') {
    const core = { cx: 110, cy: 230, r: 18 }
    const bendX = 240
    const size = 30
    const modules: ModuleSpec[] = [
      { kind: 'compute', cx: 360, cy: 150, delay: 1.05 },
      { kind: 'storage', cx: 360, cy: 310, delay: 1.17 },
    ]

    return (
      <div className={cn('relative', className)} aria-hidden="true">
        <svg viewBox="0 0 480 460" className="h-full w-full overflow-visible">
          <motion.circle
            cx={core.cx}
            cy={core.cy}
            fill={VISUAL_COLOR.stable}
            initial={reduced ? undefined : { r: 0 }}
            whileInView={{ r: core.r }}
            viewport={VISUAL_VIEWPORT}
            transition={{ duration: 0.5, ease: VISUAL_EASE }}
          />
          <circle cx={core.cx} cy={core.cy} r={core.r * 1.7} fill="none" stroke={VISUAL_COLOR.stable} strokeWidth={1} opacity={0.35} />

          {modules.map((m, idx) => (
            <SignalPath
              key={m.kind}
              d={trace(core.cx + core.r, core.cy, bendX, m.cx - size / 2, m.cy)}
              delay={0.35 + idx * 0.12}
              duration={0.7}
              reduced={reduced}
            />
          ))}
          {modules.map((m) => (
            <Module key={m.kind} spec={m} size={size} reduced={reduced} />
          ))}
        </svg>
      </div>
    )
  }

  const core = { cx: 150, cy: 190, r: 22 }
  const bendX = 300
  const size = 36
  const modules: ModuleSpec[] = [
    { kind: 'compute', cx: 460, cy: 70, delay: 1.05 },
    { kind: 'kubernetes', cx: 460, cy: 160, delay: 1.17 },
    { kind: 'storage', cx: 460, cy: 250, delay: 1.29 },
    { kind: 'network', cx: 460, cy: 340, delay: 1.41 },
  ]
  const firstTracePoints = {
    cx: [core.cx + core.r, bendX, bendX, modules[0].cx - size / 2],
    cy: [core.cy, core.cy, modules[0].cy, modules[0].cy],
  }

  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <svg viewBox="0 0 620 380" className="h-full w-full overflow-visible">
        <motion.circle
          cx={core.cx}
          cy={core.cy}
          fill={VISUAL_COLOR.stable}
          initial={reduced ? undefined : { r: 0 }}
          whileInView={{ r: core.r }}
          viewport={VISUAL_VIEWPORT}
          transition={{ duration: 0.5, ease: VISUAL_EASE }}
        />
        <circle cx={core.cx} cy={core.cy} r={core.r * 1.7} fill="none" stroke={VISUAL_COLOR.stable} strokeWidth={1} opacity={0.35} />

        {/* Kubernetes and Network are secondary on small screens — core + Compute + Storage still tells the full story on their own. */}
        {modules.map((m, idx) => (
          <g key={m.kind} className={idx % 2 === 1 ? 'hidden sm:block' : undefined}>
            <SignalPath
              d={trace(core.cx + core.r, core.cy, bendX, m.cx - size / 2, m.cy)}
              delay={0.35 + idx * 0.12}
              duration={0.7}
              reduced={reduced}
            />
            <Module spec={m} size={size} reduced={reduced} />
          </g>
        ))}

        <DeploymentPulse path={firstTracePoints} delay={1.6} reduced={reduced} />
      </svg>
    </div>
  )
}
