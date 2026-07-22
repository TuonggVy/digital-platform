import * as THREE from 'three'
import { securityMaterials } from './securityMaterials'

// Two torus rings at different tilts, sharing one center — an armillary/gyroscope silhouette
// (a genuinely enclosing 3D volume), not a flat radar-scope disc. Ring A ("equator") is the
// dominant perimeter; Ring B ("meridian") crosses through both poles for depth and containment.
export const RING_A_RADIUS = 1.5
export const RING_A_TUBE = 0.04
export const RING_A_TILT: [number, number, number] = [THREE.MathUtils.degToRad(100), 0, 0]

const RING_B_RADIUS = 1.35
const RING_B_TUBE = 0.028
const RING_B_TILT: [number, number, number] = [0, THREE.MathUtils.degToRad(25), THREE.MathUtils.degToRad(6)]

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

/** The central security core — three stepped discs plus a hairline base ring, not a shield icon. */
export function SecurityCore() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} material={securityMaterials.body}>
        <cylinderGeometry args={[0.42, 0.44, 0.1, 28]} />
      </mesh>
      <mesh position={[0, 0.045, 0]} material={securityMaterials.body}>
        <cylinderGeometry args={[0.3, 0.33, 0.1, 28]} />
      </mesh>
      <mesh position={[0, 0.17, 0]} material={securityMaterials.body}>
        <cylinderGeometry args={[0.2, 0.23, 0.11, 24]} />
      </mesh>
      <mesh position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]} material={securityMaterials.edge}>
        <torusGeometry args={[0.47, 0.01, 8, 48]} />
      </mesh>
      <mesh position={[0, 0.225, 0]} material={securityMaterials.active}>
        <sphereGeometry args={[0.04, 14, 14]} />
      </mesh>
    </group>
  )
}

/** The two static perimeter rings. */
export function SecurityRings() {
  return (
    <>
      <group rotation={RING_A_TILT}>
        <mesh material={securityMaterials.edge}>
          <torusGeometry args={[RING_A_RADIUS, RING_A_TUBE, 10, 64]} />
        </mesh>
      </group>
      <group rotation={RING_B_TILT}>
        <mesh material={securityMaterials.edge}>
          <torusGeometry args={[RING_B_RADIUS, RING_B_TUBE, 8, 56]} />
        </mesh>
      </group>
    </>
  )
}
