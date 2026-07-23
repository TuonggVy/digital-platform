import { createRef, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { RootRig } from '../shared/RootRig'
import { SceneLighting } from '../shared/SceneLighting'
import { SceneEnvironment } from '../shared/SceneEnvironment'
import { SceneEffects } from '../shared/SceneEffects'
import { FloatingGroup } from '../shared/FloatingGroup'
import { useSceneEntranceTimeline } from '../shared/animation'
import { CloudCore } from './CloudCore'
import { CloudModule, type CloudModuleSpec } from './CloudModule'
import { CloudConnections, type ConnectionSpec } from './CloudConnections'

const CORE_POSITION: [number, number, number] = [0, 0, 0.3]

// Five satellite categories arranged around the core — compute / storage / network / analytics /
// security — spaced so nothing overlaps and everything stays within the camera's framing.
const SATELLITES: CloudModuleSpec[] = [
  { kind: 'compute', position: [1.55, 0.95, -0.25], size: [0.85, 0.65, 0.45] },
  { kind: 'storage', position: [-1.55, -0.5, 0.35], size: [0.9, 0.65, 0.5] },
  { kind: 'network', position: [-1.7, 0.65, -0.7], size: [0.9, 0.6, 0.5] },
  { kind: 'analytics', position: [1.65, -0.9, -0.5], size: [0.85, 0.7, 0.45] },
  { kind: 'security', position: [0.15, -1.25, -1.0], size: [0.75, 0.6, 0.45] },
]

const ENTRY_DELAYS = [0.12, 0.24, 0.36, 0.48, 0.6]

function scalePosition(position: [number, number, number], factor: number): [number, number, number] {
  return [position[0] * factor, position[1] * factor, position[2] * factor]
}

function scaleModuleSpacing(modules: CloudModuleSpec[], factor: number): CloudModuleSpec[] {
  return modules.map((m) => ({ ...m, position: scalePosition(m.position, factor) }))
}

export interface CloudInfrastructureSceneProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  compact: boolean
  inView: boolean
}

/** Small continuous camera drift so the composition never looks perfectly static — frozen under
 *  reduced motion or while scrolled out of view. */
function CameraDrift({ reduced, inView }: { reduced: boolean; inView: boolean }) {
  useFrame((state) => {
    if (reduced || !inView) return
    const t = state.clock.elapsedTime
    state.camera.position.x = Math.sin(t * ((Math.PI * 2) / 10)) * 0.05
    state.camera.position.y = 0.6 + Math.cos(t * ((Math.PI * 2) / 13)) * 0.04
  })
  return null
}

/** The lazy-loaded chunk: Canvas, lights, camera, and the core/module/connection composition. */
export default function CloudInfrastructureScene({
  rotY,
  rotX,
  scale,
  reduced,
  compact,
  inView,
}: CloudInfrastructureSceneProps) {
  const satellites = compact ? scaleModuleSpacing(SATELLITES, 0.8) : SATELLITES
  const corePosition = compact ? scalePosition(CORE_POSITION, 0.8) : CORE_POSITION

  const connections: ConnectionSpec[] = useMemo(
    () => satellites.map((m) => ({ from: corePosition, to: m.position })),
    [satellites, corePosition],
  )

  const coreRef = useRef<THREE.Group>(null!)
  // Stable per-satellite refs (satellite count/order never changes, only positions do), so a
  // fresh RefObject per module is created once and reused across compact/full re-renders.
  const moduleRefs = useMemo(() => SATELLITES.map(() => createRef<THREE.Group>()), [])

  useSceneEntranceTimeline(
    [
      { ref: coreRef, delay: 0 },
      ...satellites.map((_, i) => ({ ref: moduleRefs[i], delay: ENTRY_DELAYS[i] ?? 0.12 * (i + 1) })),
    ],
    reduced,
  )

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{ position: [0, 0.6, 7], fov: 32 }}
      style={{ background: 'transparent' }}
      frameloop={reduced ? 'demand' : inView ? 'always' : 'never'}
    >
      <SceneLighting />
      <SceneEnvironment />
      <CameraDrift reduced={reduced} inView={inView} />
      <RootRig rotY={rotY} rotX={rotX} scale={scale} reduced={reduced}>
        <CloudCore ref={coreRef} position={corePosition} reduced={reduced} />
        {satellites.map((spec, i) => (
          <FloatingGroup key={spec.kind} position={spec.position} phase={i * 1.15} reduced={reduced}>
            <CloudModule ref={moduleRefs[i]} spec={spec} />
          </FloatingGroup>
        ))}
        <CloudConnections connections={connections} reduced={reduced} />
      </RootRig>
      <ContactShadows position={[0, -1.6, 0]} opacity={0.32} scale={8} blur={2.6} far={4} color="#03101f" />
      <SceneEffects enabled={!compact} />
    </Canvas>
  )
}
