import { forwardRef, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'
import { StatusLight, type StatusLightHandle } from '../shared/StatusLight'
import { pointOnRingA } from './SecurityRings'

export type DeviceKind = 'laptop' | 'mobile' | 'tablet' | 'endpoint'

export interface ProtectedDeviceSpec {
  kind: DeviceKind
  /** Fixed orbital slot on Ring A's plane — position is derived from this each frame (rather
   *  than baked once) so a small angular wobble can be layered on top of it. */
  angleDeg: number
  radius: number
}

/** A restrained, category-specific detail — abstract silhouette, never a fake screen or text. */
function DeviceDetail({ kind }: { kind: DeviceKind }) {
  switch (kind) {
    case 'laptop':
      return (
        <mesh position={[0, -0.07, 0.075]} rotation={[-0.35, 0, 0]} material={visualMaterials.plasticPanel}>
          <boxGeometry args={[0.17, 0.12, 0.01]} />
        </mesh>
      )
    case 'mobile':
      return (
        <mesh position={[0, 0, 0.04]} material={visualMaterials.plasticPanel}>
          <boxGeometry args={[0.07, 0.13, 0.016]} />
        </mesh>
      )
    case 'tablet':
      return (
        <mesh position={[0, 0, 0.036]} material={visualMaterials.plasticPanel}>
          <boxGeometry args={[0.12, 0.16, 0.012]} />
        </mesh>
      )
    case 'endpoint':
      return (
        <mesh position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={visualMaterials.plasticPanel}>
          <cylinderGeometry args={[0.07, 0.07, 0.024, 16]} />
        </mesh>
      )
    default:
      return null
  }
}

// A controlled back-and-forth of a few degrees around the device's fixed slot — not a full orbit
// revolution — so the perimeter reads as "managed/monitored", never as a spinning ferris wheel.
const OSCILLATION_AMPLITUDE_DEG = 2.2
const OSCILLATION_PERIOD_SECONDS = 9

export interface ProtectedDeviceProps {
  spec: ProtectedDeviceSpec
  /** Phase offset (radians) so devices don't wobble in lockstep. */
  phase: number
  reduced: boolean
  /** Lets the scene's `ProtectionPulse` flash this device's status light when the expanding
   *  pulse's radius sweeps past this device's orbital radius. */
  statusHandleRef?: RefObject<StatusLightHandle | null>
}

/** One protected endpoint — rounded body, one abstract detail, one status light — sitting in a
 *  fixed orbital slot on Ring A with a small continuous angular wobble. Entrance pop-in (scale
 *  0 -> 1) is driven externally by the scene's `useSceneEntranceTimeline`, via the forwarded ref. */
export const ProtectedDevice = forwardRef<THREE.Group, ProtectedDeviceProps>(function ProtectedDevice(
  { spec, phase, reduced, statusHandleRef },
  ref,
) {
  const pivotRef = useRef<THREE.Group>(null!)

  const basePosition = useMemo(
    () => pointOnRingA(spec.angleDeg, spec.radius),
    [spec.angleDeg, spec.radius],
  )
  const baseRotationY = useMemo(() => -THREE.MathUtils.degToRad(spec.angleDeg), [spec.angleDeg])

  useFrame((state) => {
    const pivot = pivotRef.current
    if (!pivot || reduced) return
    const t = state.clock.elapsedTime
    const wobbleDeg =
      Math.sin(t * ((Math.PI * 2) / OSCILLATION_PERIOD_SECONDS) + phase) * OSCILLATION_AMPLITUDE_DEG
    const [x, y, z] = pointOnRingA(spec.angleDeg + wobbleDeg, spec.radius)
    pivot.position.set(x, y, z)
    pivot.rotation.y = -THREE.MathUtils.degToRad(spec.angleDeg + wobbleDeg)
  })

  return (
    <group ref={ref}>
      <group ref={pivotRef} position={basePosition} rotation={[0, baseRotationY, 0]}>
        <RoundedBox args={[0.22, 0.18, 0.08]} radius={0.025} smoothness={2} material={visualMaterials.metal} />
        <DeviceDetail kind={spec.kind} />
        <StatusLight position={[0.08, 0.065, 0.045]} radius={0.015} handleRef={statusHandleRef} />
      </group>
    </group>
  )
})
