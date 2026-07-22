import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { cloudMaterials } from './cloudMaterials'

export type ModuleKind3D = 'compute' | 'kubernetes' | 'storage' | 'backup' | 'network'

export interface CloudModuleSpec {
  kind: ModuleKind3D
  position: [number, number, number]
  size: [number, number, number]
}

/** A restrained, category-specific detail sitting on the module's front panel — abstract, not an icon. */
function ModuleDetail({ kind, size }: { kind: ModuleKind3D; size: [number, number, number] }) {
  const [w, h, d] = size
  const z = d / 2 + 0.03

  switch (kind) {
    case 'compute':
      return (
        <group position={[0, -0.02, z]}>
          {[-0.16, 0, 0.16].map((x, i) => (
            <mesh key={x} position={[x, i * 0.03, 0]} material={cloudMaterials.edge}>
              <boxGeometry args={[0.05, 0.16 + i * 0.07, 0.02]} />
            </mesh>
          ))}
        </group>
      )
    case 'kubernetes':
      return (
        <mesh position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} material={cloudMaterials.edge}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 6]} />
        </mesh>
      )
    case 'storage':
      return (
        <group position={[0, 0, z]}>
          {[-0.08, 0, 0.08].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={cloudMaterials.edge}>
              <cylinderGeometry args={[0.16, 0.16, 0.032, 20]} />
            </mesh>
          ))}
        </group>
      )
    case 'backup':
      return (
        <group>
          <mesh position={[0, 0, z]} material={cloudMaterials.edge}>
            <cylinderGeometry args={[0.12, 0.12, 0.03, 20]} />
          </mesh>
          {/* A faint duplicate sitting just behind — reads as "redundant copy" rather than a literal icon. */}
          <mesh position={[-0.05, -0.04, z - 0.12]} material={cloudMaterials.panel}>
            <boxGeometry args={[w * 0.6, h * 0.6, 0.04]} />
          </mesh>
        </group>
      )
    case 'network':
      return (
        <mesh position={[0, 0, z]} rotation={[0, 0, Math.PI / 4]} material={cloudMaterials.edge}>
          <boxGeometry args={[0.18, 0.18, 0.03]} />
        </mesh>
      )
    default:
      return null
  }
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

const REVEAL_DURATION = 0.45

interface CloudModuleProps {
  spec: CloudModuleSpec
  delay: number
  reduced: boolean
}

/** One infrastructure module — rounded body, inset panel, one status light, one category detail.
 *  Pops in once (scale 0 → 1) after `delay` seconds; skipped entirely under reduced motion. */
export function CloudModule({ spec, delay, reduced }: CloudModuleProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const settledRef = useRef(reduced)
  const [w, h, d] = spec.size

  useFrame((state) => {
    const group = groupRef.current
    if (!group || settledRef.current) return
    const elapsed = Math.max(0, state.clock.elapsedTime - delay)
    const progress = Math.min(1, elapsed / REVEAL_DURATION)
    group.scale.setScalar(easeOutCubic(progress))
    if (progress >= 1) settledRef.current = true
  })

  return (
    <group ref={groupRef} position={spec.position} scale={reduced ? 1 : 0}>
      <RoundedBox args={[w, h, d]} radius={Math.min(w, h, d) * 0.09} smoothness={2} material={cloudMaterials.body} />
      <mesh position={[0, 0, d / 2 + 0.005]} material={cloudMaterials.panel}>
        <boxGeometry args={[w * 0.88, h * 0.88, 0.01]} />
      </mesh>
      <ModuleDetail kind={spec.kind} size={spec.size} />
      <mesh position={[w * 0.32, h * 0.36, d / 2 + 0.02]} material={cloudMaterials.active}>
        <sphereGeometry args={[0.04, 12, 12]} />
      </mesh>
    </group>
  )
}
