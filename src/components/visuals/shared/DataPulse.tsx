import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VISUAL_COLOR } from './palette'

function pointAtT(points: THREE.Vector3[], t: number): THREE.Vector3 {
  const segLengths = points.slice(1).map((p, i) => p.distanceTo(points[i]))
  const total = segLengths.reduce((a, b) => a + b, 0)
  let remaining = t * total
  for (let i = 0; i < segLengths.length; i++) {
    if (remaining <= segLengths[i] || i === segLengths.length - 1) {
      const segT = segLengths[i] === 0 ? 0 : Math.min(1, remaining / segLengths[i])
      return points[i].clone().lerp(points[i + 1], segT)
    }
    remaining -= segLengths[i]
  }
  return points[points.length - 1].clone()
}

export interface TravelingPulseProps {
  points: THREE.Vector3[]
  startDelay: number
  duration: number
  /** When true, the pulse repeats every `duration + cycleGap` seconds instead of firing once. */
  loop?: boolean
  cycleGap?: number
  radius?: number
  color?: string
  reduced: boolean
}

/** One small emissive sphere traveling a path once, or on a slow repeat-with-rest cycle. Replaces
 *  the near-identical `DataPacket` (cloud3d) / `TransferPacket` (esim3d) implementations. */
export function TravelingPulse({
  points,
  startDelay,
  duration,
  loop = false,
  cycleGap = 2.5,
  radius = 0.045,
  color = VISUAL_COLOR.active,
  reduced,
}: TravelingPulseProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const doneRef = useRef(false)
  const cyclePeriod = duration + cycleGap

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || reduced || doneRef.current) return
    const elapsed = state.clock.elapsedTime - startDelay
    if (elapsed < 0) {
      mesh.visible = false
      return
    }

    const cursor = loop ? elapsed % cyclePeriod : elapsed
    if (cursor > duration) {
      mesh.visible = false
      if (!loop) doneRef.current = true
      return
    }

    mesh.visible = true
    const t = Math.min(1, cursor / duration)
    mesh.position.copy(pointAtT(points, t))
    if (materialRef.current) {
      materialRef.current.opacity = t > 0.88 ? Math.max(0, 1 - (t - 0.88) / 0.12) : 1
    }
  })

  if (reduced) return null

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.1}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

export interface RingPulseProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  startDelay: number
  duration: number
  maxScale: number
  baseOpacity?: number
  tube?: number
  ringRadius?: number
  loop?: boolean
  cycleGap?: number
  color?: string
  reduced: boolean
  /** Fires every frame the pulse is active with progress (0..1) — lets a parent trigger side
   *  effects (e.g. flashing a StatusLight) as the pulse's radius crosses a known distance. */
  onUpdate?: (t: number) => void
}

/** One expanding, fading ring — replaces the near-identical "signal absorbed" pulse in
 *  `IncomingSignal` (security3d) and `RingPulse` (esim3d). Supports a one-shot cue or a slow
 *  repeat-with-rest cycle (used for Kaspersky's continuous protection pulse). */
export function RingPulse({
  position,
  rotation = [0, 0, 0],
  startDelay,
  duration,
  maxScale,
  baseOpacity = 0.6,
  tube = 0.01,
  ringRadius = 0.08,
  loop = false,
  cycleGap = 6,
  color = VISUAL_COLOR.active,
  reduced,
  onUpdate,
}: RingPulseProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const doneRef = useRef(false)
  const cyclePeriod = duration + cycleGap

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || reduced || doneRef.current) return
    const elapsed = state.clock.elapsedTime - startDelay
    if (elapsed < 0) {
      mesh.visible = false
      return
    }

    const cursor = loop ? elapsed % cyclePeriod : elapsed
    if (cursor > duration) {
      mesh.visible = false
      if (!loop) doneRef.current = true
      return
    }

    mesh.visible = true
    const t = cursor / duration
    mesh.scale.setScalar(1 + t * (maxScale - 1))
    if (materialRef.current) materialRef.current.opacity = Math.max(0, baseOpacity * (1 - t))
    onUpdate?.(t)
  })

  if (reduced) return null

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} visible={false}>
      <torusGeometry args={[ringRadius, tube, 8, 24]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.9}
        transparent
        opacity={baseOpacity}
      />
    </mesh>
  )
}
