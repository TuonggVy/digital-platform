import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VISUAL_COLOR } from '../shared/palette'
import { FloatingGroup } from '../shared/FloatingGroup'

interface EsimCoverageProps {
  reduced: boolean
  compact: boolean
}

interface ArcConfig {
  position: [number, number, number]
  rotation: [number, number, number]
  radius: number
  tube: number
  arc: number
  baseOpacity: number
  breathPeriod: number
  phase: number
}

// Large, faint background arcs — distinct from the small on-screen coverage arcs on the phone
// itself. Bigger radius, thinner tube, much lower opacity, tucked behind the phone in Z.
const ARC_CONFIGS: ArcConfig[] = [
  {
    position: [-0.1, 0.1, -0.9],
    rotation: [0.3, 0.5, 0],
    radius: 1.5,
    tube: 0.008,
    arc: Math.PI * 1.15,
    baseOpacity: 0.16,
    breathPeriod: 6.5,
    phase: 0,
  },
  {
    position: [0.15, -0.15, -1.1],
    rotation: [-0.2, -0.6, 0.4],
    radius: 1.75,
    tube: 0.007,
    arc: Math.PI * 0.9,
    baseOpacity: 0.12,
    breathPeriod: 7.8,
    phase: Math.PI * 0.7,
  },
]

const NODE_POSITIONS: [number, number, number][] = [
  [-0.55, 0.35, -0.85],
  [0.5, -0.25, -1.0],
  [0.05, 0.55, -1.15],
]

/** One large arc — a slow continuous "breathing" opacity oscillation, frozen at its base opacity
 *  under reduced motion. */
function CoverageArc({ config, reduced }: { config: ArcConfig; reduced: boolean }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    if (reduced) {
      material.opacity = config.baseOpacity
      return
    }
    const t = state.clock.elapsedTime * ((Math.PI * 2) / config.breathPeriod) + config.phase
    const breathe = 0.55 + 0.45 * Math.sin(t)
    material.opacity = config.baseOpacity * breathe
  })

  return (
    <mesh position={config.position} rotation={config.rotation}>
      <torusGeometry args={[config.radius, config.tube, 8, 48, config.arc]} />
      <meshStandardMaterial
        ref={materialRef}
        color={VISUAL_COLOR.active}
        emissive={VISUAL_COLOR.active}
        emissiveIntensity={0.4}
        transparent
        opacity={config.baseOpacity}
        depthWrite={false}
      />
    </mesh>
  )
}

/** A small, mostly-static location node near/on an arc — a tiny idle bob is fine, nothing
 *  attention-grabbing. */
function CoverageNode({
  position,
  phase,
  reduced,
}: {
  position: [number, number, number]
  phase: number
  reduced: boolean
}) {
  return (
    <FloatingGroup position={position} bobAmplitude={0.02} bobPeriod={6} tiltAmplitude={0} phase={phase} reduced={reduced}>
      <mesh>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshStandardMaterial
          color={VISUAL_COLOR.active}
          emissive={VISUAL_COLOR.active}
          emissiveIntensity={0.5}
          transparent
          opacity={0.35}
        />
      </mesh>
    </FloatingGroup>
  )
}

/** Large, faint, ambient coverage arcs behind the phone, suggesting "global coverage" — kept to a
 *  low object count so this reads as background depth, not a second layer of clutter. Density is
 *  trimmed further on `compact` (tablet) to protect performance. */
export function EsimCoverage({ reduced, compact }: EsimCoverageProps) {
  const arcs = compact ? ARC_CONFIGS.slice(0, 1) : ARC_CONFIGS
  const nodes = compact ? NODE_POSITIONS.slice(0, 2) : NODE_POSITIONS

  return (
    <group>
      {arcs.map((config, i) => (
        <CoverageArc key={i} config={config} reduced={reduced} />
      ))}
      {nodes.map((position, i) => (
        <CoverageNode key={i} position={position} phase={i * 1.7} reduced={reduced} />
      ))}
    </group>
  )
}
