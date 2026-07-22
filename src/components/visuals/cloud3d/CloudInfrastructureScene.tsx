import { useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { CloudModule, type CloudModuleSpec } from './CloudModule'
import { CloudConnections, type ConnectionSpec } from './CloudConnections'

interface ModuleEntry extends CloudModuleSpec {
  delay: number
}

const CORE_POSITION: [number, number, number] = [0, 0.1, 0.85]

// Central Compute Core forward; Kubernetes upper-side, Storage lower-front, Network opposite the
// core, Backup lowest and deepest — a readable infrastructure layout, not a random scatter.
const MODULES: ModuleEntry[] = [
  { kind: 'compute', position: CORE_POSITION, size: [1.15, 0.85, 0.55], delay: 0 },
  { kind: 'kubernetes', position: [1.5, 1.0, -0.3], size: [0.85, 0.85, 0.5], delay: 0.14 },
  { kind: 'storage', position: [-1.5, -0.55, 0.3], size: [0.9, 0.65, 0.5], delay: 0.28 },
  { kind: 'network', position: [-1.7, 0.6, -0.75], size: [0.9, 0.6, 0.5], delay: 0.42 },
  { kind: 'backup', position: [0.2, -1.15, -1.05], size: [0.75, 0.6, 0.45], delay: 0.56 },
]

const SUPPORT_MODULES = MODULES.slice(1)
const CONNECTIONS: ConnectionSpec[] = SUPPORT_MODULES.map((m) => ({ from: CORE_POSITION, to: m.position }))
const PACKET_TARGET = MODULES.find((m) => m.kind === 'network')!.position

function scalePosition(position: [number, number, number], factor: number): [number, number, number] {
  return [position[0] * factor, position[1] * factor, position[2] * factor]
}

function scaleModuleSpacing(modules: ModuleEntry[], factor: number): ModuleEntry[] {
  return modules.map((m) => ({ ...m, position: scalePosition(m.position, factor) }))
}

function scaleConnectionSpacing(connections: ConnectionSpec[], factor: number): ConnectionSpec[] {
  return connections.map((c) => ({ from: scalePosition(c.from, factor), to: scalePosition(c.to, factor) }))
}

interface RootRigProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  children: ReactNode
}

/** Reads the scroll-driven motion values via .get() inside useFrame and lerps the group's real
 *  transform directly — no React state, no re-render, on every scroll tick. */
function RootRig({ rotY, rotX, scale, reduced, children }: RootRigProps) {
  const ref = useRef<THREE.Group>(null!)

  useFrame(() => {
    const group = ref.current
    if (!group) return
    const targetY = THREE.MathUtils.degToRad(rotY.get())
    const targetX = THREE.MathUtils.degToRad(rotX.get())
    const targetScale = scale.get()
    const lerpFactor = reduced ? 1 : 0.1
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, lerpFactor)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, lerpFactor)
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, lerpFactor))
  })

  return <group ref={ref}>{children}</group>
}

export interface CloudInfrastructureSceneProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  compact: boolean
}

/** The lazy-loaded chunk: Canvas, lights, camera, and the module/connection composition. */
export default function CloudInfrastructureScene({ rotY, rotX, scale, reduced, compact }: CloudInfrastructureSceneProps) {
  const modules = compact ? scaleModuleSpacing(MODULES, 0.8) : MODULES
  const connections = compact ? scaleConnectionSpacing(CONNECTIONS, 0.8) : CONNECTIONS
  const packetTarget = compact ? scalePosition(PACKET_TARGET, 0.8) : PACKET_TARGET

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.6, 7], fov: 32 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -1, -3]} intensity={0.3} color="#3fa9dd" />
      <RootRig rotY={rotY} rotX={rotX} scale={scale} reduced={reduced}>
        {modules.map((m) => (
          <CloudModule key={m.kind} spec={m} delay={m.delay} reduced={reduced} />
        ))}
        <CloudConnections connections={connections} packetTarget={packetTarget} reduced={reduced} />
      </RootRig>
    </Canvas>
  )
}
