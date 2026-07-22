import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'

type NodeKind = 'hub' | 'country' | 'cloud' | 'shield'

interface MapNode {
  id: string
  x: number
  y: number
  kind: NodeKind
  code: string
  label: string
}

const ALL_NODES: MapNode[] = [
  { id: 'hub', x: 130, y: 250, kind: 'hub', code: 'VN', label: 'VTC · HUB' },
  { id: 'jp', x: 470, y: 74, kind: 'country', code: 'JP', label: 'TOKYO' },
  { id: 'kr', x: 566, y: 168, kind: 'country', code: 'KR', label: 'SEOUL' },
  { id: 'th', x: 398, y: 430, kind: 'country', code: 'TH', label: 'BANGKOK' },
  { id: 'eu', x: 214, y: 54, kind: 'country', code: 'EU', label: 'EUROPE' },
  { id: 'us', x: 340, y: 40, kind: 'country', code: 'US', label: 'U.S.' },
  { id: 'cloud-1', x: 344, y: 322, kind: 'cloud', code: 'SGN-01', label: '99.98%' },
  { id: 'cloud-2', x: 480, y: 372, kind: 'cloud', code: 'HAN-02', label: '99.95%' },
  { id: 'shield-1', x: 268, y: 150, kind: 'shield', code: 'EP-114', label: 'PROTECTED' },
  { id: 'shield-2', x: 420, y: 218, kind: 'shield', code: 'EP-207', label: 'PROTECTED' },
]

const KIND_COLOR: Record<NodeKind, string> = {
  hub: 'var(--home-beacon)',
  country: 'var(--home-wire)',
  cloud: 'var(--home-wire)',
  shield: 'var(--home-wire)',
}

function controlPoint(hub: MapNode, target: MapNode) {
  const mx = (hub.x + target.x) / 2
  const my = (hub.y + target.y) / 2
  const dx = target.x - hub.x
  const dy = target.y - hub.y
  return { x: mx - dy * 0.14, y: my + dx * 0.14 }
}

interface CoverageMapProps {
  /**
   * Only 'hero' remains — the all-category platform overview. Cloud/security/esim
   * used to select a subset of these nodes per product category; that job now
   * belongs to CloudProductVisual/SecurityProductVisual/EsimProductVisual
   * (see src/components/visuals/product/), so CoverageMap only needs to render
   * the full network.
   */
  variant?: 'hero'
  tone?: 'dark' | 'light'
  showLabels?: boolean
  className?: string
}

export function CoverageMap({
  tone = 'dark',
  showLabels = true,
  className,
}: CoverageMapProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  const hub = ALL_NODES.find((n) => n.id === 'hub')!
  const nodes = ALL_NODES
  const spokes = nodes.filter((n) => n.kind !== 'hub')

  const lineColor = tone === 'dark' ? 'rgba(220,232,245,0.35)' : 'rgba(11,31,51,0.22)'
  const labelColor = tone === 'dark' ? 'rgba(245,248,251,0.7)' : 'var(--home-graphite-soft)'

  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <svg viewBox="0 0 620 470" className="h-full w-full overflow-visible">
        {spokes.map((node, idx) => {
          const cp = controlPoint(hub, node)
          const d = `M${hub.x},${hub.y} Q${cp.x},${cp.y} ${node.x},${node.y}`
          return (
            <motion.path
              key={`line-${node.id}`}
              d={d}
              fill="none"
              stroke={lineColor}
              strokeWidth={1.25}
              strokeDasharray="1 0"
              initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.1, delay: 0.15 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          )
        })}

        {!reduced &&
          spokes.map((node, idx) => {
            const cp = controlPoint(hub, node)
            const d = `M${hub.x},${hub.y} Q${cp.x},${cp.y} ${node.x},${node.y}`
            return (
              <motion.path
                key={`pulse-${node.id}`}
                d={d}
                fill="none"
                stroke="var(--home-wire)"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeDasharray="10 240"
                initial={{ strokeDashoffset: 0, opacity: 0 }}
                animate={{ strokeDashoffset: -250, opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  repeatDelay: 1.6,
                  delay: 1.4 + idx * 0.5,
                  ease: 'linear',
                }}
              />
            )
          })}

        {nodes.map((node, idx) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            {node.kind === 'hub' ? (
              <>
                <motion.circle
                  r={16}
                  fill="none"
                  stroke="var(--home-beacon)"
                  strokeWidth={1}
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={reduced ? undefined : { opacity: [0.5, 0, 0.5], scale: [1, 1.9, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <circle r={7} fill="var(--home-beacon)" />
              </>
            ) : (
              <motion.circle
                r={4.5}
                fill={KIND_COLOR[node.kind]}
                initial={reduced ? undefined : { opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.08 }}
              />
            )}

            {showLabels && node.kind !== 'hub' && (
              <motion.g
                initial={reduced ? undefined : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.08 }}
              >
                <text
                  x={node.x > 310 ? 10 : -10}
                  y={-4}
                  textAnchor={node.x > 310 ? 'start' : 'end'}
                  fontFamily="var(--font-data)"
                  fontSize={11}
                  fontWeight={500}
                  fill={tone === 'dark' ? '#F5F8FB' : 'var(--home-graphite)'}
                  letterSpacing="0.05em"
                >
                  {node.code}
                </text>
                <text
                  x={node.x > 310 ? 10 : -10}
                  y={10}
                  textAnchor={node.x > 310 ? 'start' : 'end'}
                  fontFamily="var(--font-data)"
                  fontSize={9}
                  fill={labelColor}
                  letterSpacing="0.04em"
                >
                  {node.label}
                </text>
              </motion.g>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
