import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { securityMaterials } from './securityMaterials'

export type DeviceKind = 'laptop' | 'mobile' | 'tablet' | 'endpoint'

export interface ProtectedDeviceSpec {
  kind: DeviceKind
  position: [number, number, number]
  rotation?: [number, number, number]
}

/** A restrained, category-specific detail — abstract silhouette, never a fake screen or text. */
function DeviceDetail({ kind }: { kind: DeviceKind }) {
  switch (kind) {
    case 'laptop':
      return (
        <mesh position={[0, -0.07, 0.075]} rotation={[-0.35, 0, 0]} material={securityMaterials.panel}>
          <boxGeometry args={[0.17, 0.12, 0.01]} />
        </mesh>
      )
    case 'mobile':
      return (
        <mesh position={[0, 0, 0.04]} material={securityMaterials.panel}>
          <boxGeometry args={[0.07, 0.13, 0.016]} />
        </mesh>
      )
    case 'tablet':
      return (
        <mesh position={[0, 0, 0.036]} material={securityMaterials.panel}>
          <boxGeometry args={[0.12, 0.16, 0.012]} />
        </mesh>
      )
    case 'endpoint':
      return (
        <mesh position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={securityMaterials.panel}>
          <cylinderGeometry args={[0.07, 0.07, 0.024, 16]} />
        </mesh>
      )
    default:
      return null
  }
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

const REVEAL_DURATION = 0.4

interface ProtectedDeviceProps {
  spec: ProtectedDeviceSpec
  delay: number
  reduced: boolean
}

/** One protected endpoint — rounded body, one abstract detail, one status light. Pops in once
 *  (scale 0 → 1) after `delay` seconds; skipped entirely under reduced motion. */
export function ProtectedDevice({ spec, delay, reduced }: ProtectedDeviceProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const settledRef = useRef(reduced)

  useFrame((state) => {
    const group = groupRef.current
    if (!group || settledRef.current) return
    const elapsed = Math.max(0, state.clock.elapsedTime - delay)
    const progress = Math.min(1, elapsed / REVEAL_DURATION)
    group.scale.setScalar(easeOutCubic(progress))
    if (progress >= 1) settledRef.current = true
  })

  return (
    <group ref={groupRef} position={spec.position} rotation={spec.rotation ?? [0, 0, 0]} scale={reduced ? 1 : 0}>
      <RoundedBox args={[0.22, 0.18, 0.08]} radius={0.025} smoothness={2} material={securityMaterials.body} />
      <DeviceDetail kind={spec.kind} />
      <mesh position={[0.08, 0.065, 0.045]} material={securityMaterials.active}>
        <sphereGeometry args={[0.015, 10, 10]} />
      </mesh>
    </group>
  )
}
