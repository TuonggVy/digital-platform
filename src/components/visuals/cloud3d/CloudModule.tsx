import { forwardRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'
import { StatusLight } from '../shared/StatusLight'

export type ModuleKind3D = 'compute' | 'storage' | 'network' | 'analytics' | 'security'

export interface CloudModuleSpec {
  kind: ModuleKind3D
  position: [number, number, number]
  size: [number, number, number]
}

/** A restrained, category-specific detail sitting on the module's front panel — abstract, not an icon. */
function ModuleDetail({ kind, size }: { kind: ModuleKind3D; size: [number, number, number] }) {
  const d = size[2]
  const z = d / 2 + 0.03

  switch (kind) {
    case 'compute':
      // Roughly-even vertical bars — distinct from analytics' ascending staircase below.
      return (
        <group position={[0, -0.02, z]}>
          {[-0.16, 0, 0.16].map((x, i) => (
            <mesh key={x} position={[x, i * 0.03, 0]} material={visualMaterials.edge}>
              <boxGeometry args={[0.05, 0.16 + i * 0.07, 0.02]} />
            </mesh>
          ))}
        </group>
      )
    case 'storage':
      return (
        <group position={[0, 0, z]}>
          {[-0.08, 0, 0.08].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={visualMaterials.edge}>
              <cylinderGeometry args={[0.16, 0.16, 0.032, 20]} />
            </mesh>
          ))}
        </group>
      )
    case 'network':
      return (
        <mesh position={[0, 0, z]} rotation={[0, 0, Math.PI / 4]} material={visualMaterials.edge}>
          <boxGeometry args={[0.18, 0.18, 0.03]} />
        </mesh>
      )
    case 'analytics':
      // Small ascending "step" bar-chart, arranged diagonally — visually distinct from compute's
      // even bars.
      return (
        <group position={[0, -0.06, z]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.14 + i * 0.14, -0.05 + i * 0.075, 0]} material={visualMaterials.active}>
              <boxGeometry args={[0.09, 0.08 + i * 0.08, 0.02]} />
            </mesh>
          ))}
        </group>
      )
    case 'security':
      // Abstract hex-bolt: a hexagonal prism with a thin ring in front — deliberately not a
      // shield/logo (the Kaspersky scene owns that shape language).
      return (
        <group position={[0, 0, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={visualMaterials.edge}>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 6]} />
          </mesh>
          <mesh position={[0, 0, 0.035]} material={visualMaterials.edge}>
            <torusGeometry args={[0.17, 0.013, 8, 24]} />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

export interface CloudModuleProps {
  spec: CloudModuleSpec
}

/** One infrastructure satellite module — rounded body, inset panel, one status light, one
 *  category-specific detail. Entrance (scale 0 -> 1) is driven externally by the Scene via
 *  `useSceneEntranceTimeline` against the forwarded ref; this component owns no reveal timing of
 *  its own. Positioning/idle float is likewise applied by the caller (a `FloatingGroup` wrapper at
 *  the Scene level) so the forwarded ref keeps pointing at the actual scaling group. */
export const CloudModule = forwardRef<THREE.Group, CloudModuleProps>(function CloudModule({ spec }, ref) {
  const [w, h, d] = spec.size

  return (
    <group ref={ref}>
      <RoundedBox args={[w, h, d]} radius={Math.min(w, h, d) * 0.09} smoothness={2} material={visualMaterials.metal} />
      <mesh position={[0, 0, d / 2 + 0.005]} material={visualMaterials.plasticPanel}>
        <boxGeometry args={[w * 0.88, h * 0.88, 0.01]} />
      </mesh>
      <ModuleDetail kind={spec.kind} size={spec.size} />
      <StatusLight position={[w * 0.32, h * 0.36, d / 2 + 0.02]} radius={0.04} />
    </group>
  )
})
