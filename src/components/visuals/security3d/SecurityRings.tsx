import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'

// Two torus rings at different tilts, sharing one center — an armillary/gyroscope silhouette
// (a genuinely enclosing 3D volume), not a flat radar-scope disc. Ring A ("equator") is the
// dominant perimeter; Ring B ("meridian") crosses through both poles for depth and containment.
export const RING_A_RADIUS = 1.5
export const RING_A_TUBE = 0.04
export const RING_A_TILT: [number, number, number] = [THREE.MathUtils.degToRad(100), 0, 0]

const RING_B_RADIUS = 1.35
const RING_B_TUBE = 0.028
const RING_B_TILT: [number, number, number] = [0, THREE.MathUtils.degToRad(25), THREE.MathUtils.degToRad(6)]

// Third, thin ring for extra depth — a shallow tilt distinct from A/B so it reads as another
// plane of containment rather than a duplicate of either.
const RING_C_RADIUS = 1.62
const RING_C_TUBE = 0.016
const RING_C_TILT: [number, number, number] = [THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(-18), 0]

const RING_A_REVOLUTION_SECONDS = 40
const RING_B_REVOLUTION_SECONDS = 55
const RING_C_REVOLUTION_SECONDS = 70

/** A point at `angleDeg` around Ring A's own tilted plane, in world space — reused to place
 *  protected devices and the incoming signal's path consistently on/near the perimeter. */
export function pointOnRingA(angleDeg: number, radius: number = RING_A_RADIUS): [number, number, number] {
  const theta = THREE.MathUtils.degToRad(angleDeg)
  const phi = RING_A_TILT[0]
  const x = radius * Math.cos(theta)
  const y = radius * Math.sin(theta) * Math.cos(phi)
  const z = radius * Math.sin(theta) * Math.sin(phi)
  return [x, y, z]
}

// The pedestal's three stepped layers read as distinct materials — different metalness/roughness
// per layer — rather than one uniform metal block. Cloned once at module scope from the shared
// `metal` singleton so we still share its base color/clearcoat instead of re-declaring a whole
// new material.
const coreMaterialOuter = visualMaterials.metal.clone()
coreMaterialOuter.roughness = 0.5
coreMaterialOuter.metalness = 0.5

const coreMaterialMid = visualMaterials.metal.clone()
coreMaterialMid.roughness = 0.32
coreMaterialMid.metalness = 0.75

const coreMaterialTop = visualMaterials.metal.clone()
coreMaterialTop.roughness = 0.2
coreMaterialTop.metalness = 0.85

/** The central security core — three stepped discs plus a hairline base ring, not a shield icon.
 *  Sits behind the shield as the "pedestal / energy core" it draws from. */
export function SecurityCore() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} material={coreMaterialOuter}>
        <cylinderGeometry args={[0.42, 0.44, 0.1, 28]} />
      </mesh>
      <mesh position={[0, 0.045, 0]} material={coreMaterialMid}>
        <cylinderGeometry args={[0.3, 0.33, 0.1, 28]} />
      </mesh>
      <mesh position={[0, 0.17, 0]} material={coreMaterialTop}>
        <cylinderGeometry args={[0.2, 0.23, 0.11, 24]} />
      </mesh>
      <mesh position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]} material={visualMaterials.edge}>
        <torusGeometry args={[0.47, 0.01, 8, 48]} />
      </mesh>
      <mesh position={[0, 0.225, 0]} material={visualMaterials.active}>
        <sphereGeometry args={[0.04, 14, 14]} />
      </mesh>
    </group>
  )
}

/** The perimeter rings — two dominant tilted tori plus one thin depth ring, each rotating
 *  continuously about its own tilted plane at a different, slow, independent period so the
 *  whole assembly never appears to lock into a single spin. Frozen under reduced motion. */
export function SecurityRings({ reduced }: { reduced: boolean }) {
  const ringARef = useRef<THREE.Group>(null!)
  const ringBRef = useRef<THREE.Group>(null!)
  const ringCRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (reduced) return
    if (ringARef.current) ringARef.current.rotation.z += (delta * Math.PI * 2) / RING_A_REVOLUTION_SECONDS
    if (ringBRef.current) ringBRef.current.rotation.z += (delta * Math.PI * 2) / RING_B_REVOLUTION_SECONDS
    if (ringCRef.current) ringCRef.current.rotation.z -= (delta * Math.PI * 2) / RING_C_REVOLUTION_SECONDS
  })

  return (
    <>
      <group rotation={RING_A_TILT}>
        <group ref={ringARef}>
          <mesh material={visualMaterials.edge}>
            <torusGeometry args={[RING_A_RADIUS, RING_A_TUBE, 10, 64]} />
          </mesh>
        </group>
      </group>
      <group rotation={RING_B_TILT}>
        <group ref={ringBRef}>
          <mesh material={visualMaterials.edge}>
            <torusGeometry args={[RING_B_RADIUS, RING_B_TUBE, 8, 56]} />
          </mesh>
        </group>
      </group>
      <group rotation={RING_C_TILT}>
        <group ref={ringCRef}>
          <mesh material={visualMaterials.edge}>
            <torusGeometry args={[RING_C_RADIUS, RING_C_TUBE, 6, 56]} />
          </mesh>
        </group>
      </group>
    </>
  )
}
