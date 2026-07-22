import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { esimMaterials } from './esimMaterials'

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export const PROFILE_POSITION: [number, number, number] = [0.82, 0.58, -0.22]
export const PROFILE_ATTACH_POINT: [number, number, number] = [0.7, 0.48, -0.2]

const ACTIVATE_DELAY = 0.35
const ACTIVATE_DURATION = 0.3

interface EsimProfileProps {
  reduced: boolean
}

/** The digital eSIM profile — a small rounded chip beside the phone, nudged slightly back in
 *  depth. Reads as an embedded digital module, not a physical removable SIM: no gold contacts,
 *  no carrier marks, just restrained circuit-line etches and one activation point. */
export function EsimProfile({ reduced }: EsimProfileProps) {
  const dotRef = useRef<THREE.Mesh>(null!)
  const settledRef = useRef(reduced)

  useFrame((state) => {
    if (!dotRef.current || settledRef.current) return
    const elapsed = Math.max(0, state.clock.elapsedTime - ACTIVATE_DELAY)
    const t = Math.min(1, elapsed / ACTIVATE_DURATION)
    dotRef.current.scale.setScalar(easeOutCubic(t))
    if (t >= 1) settledRef.current = true
  })

  return (
    <group position={PROFILE_POSITION} rotation={[0, THREE.MathUtils.degToRad(-12), 0]}>
      <RoundedBox args={[0.26, 0.34, 0.03]} radius={0.035} smoothness={2} material={esimMaterials.edge} />
      <mesh position={[0, 0.06, 0.017]} material={esimMaterials.panel}>
        <boxGeometry args={[0.17, 0.008, 0.006]} />
      </mesh>
      <mesh position={[0, 0.03, 0.017]} material={esimMaterials.panel}>
        <boxGeometry args={[0.12, 0.008, 0.006]} />
      </mesh>
      <mesh ref={dotRef} position={[0, -0.06, 0.02]} material={esimMaterials.active} scale={reduced ? 1 : 0}>
        <sphereGeometry args={[0.024, 12, 12]} />
      </mesh>
    </group>
  )
}
