import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { securityMaterials, SECURITY_COLOR } from './securityMaterials'
import { RING_A_RADIUS, RING_A_TILT, pointOnRingA } from './SecurityRings'

const SCAN_ARC_RADIANS = THREE.MathUtils.degToRad(40)
const SCAN_REVOLUTION_SECONDS = 10

/** A short glowing arc traveling continuously around the equator ring's tube — a living
 *  monitoring pulse, not a radar wedge. One loop, linear, ~10s per revolution. */
function ScanArc({ reduced }: { reduced: boolean }) {
  const pivotRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (reduced || !pivotRef.current) return
    pivotRef.current.rotation.z += (delta * Math.PI * 2) / SCAN_REVOLUTION_SECONDS
  })

  return (
    <group rotation={RING_A_TILT}>
      <group ref={pivotRef}>
        <mesh material={securityMaterials.active}>
          <torusGeometry args={[RING_A_RADIUS, 0.045, 8, 24, SCAN_ARC_RADIANS]} />
        </mesh>
      </group>
    </group>
  )
}

const SIGNAL_ANGLE = 200
const SIGNAL_START_DELAY = 1.4
const SIGNAL_TRAVEL_DURATION = 0.9
const SIGNAL_PULSE_DURATION = 0.5

/** One-time: a signal approaches the perimeter from outside and is absorbed at contact —
 *  never repeats, never simulates a recurring attack. */
function IncomingSignal({ reduced }: { reduced: boolean }) {
  const sphereRef = useRef<THREE.Mesh>(null!)
  const sphereMaterialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const pulseRef = useRef<THREE.Mesh>(null!)
  const pulseMaterialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const doneRef = useRef(reduced)

  const fromV = new THREE.Vector3(...pointOnRingA(SIGNAL_ANGLE, RING_A_RADIUS + 1.0))
  const toV = new THREE.Vector3(...pointOnRingA(SIGNAL_ANGLE, RING_A_RADIUS))

  useFrame((state) => {
    if (doneRef.current) return
    const sphere = sphereRef.current
    const pulse = pulseRef.current
    if (!sphere || !pulse) return
    const elapsed = state.clock.elapsedTime - SIGNAL_START_DELAY

    if (elapsed < 0) {
      sphere.visible = false
      pulse.visible = false
      return
    }

    if (elapsed <= SIGNAL_TRAVEL_DURATION) {
      sphere.visible = true
      pulse.visible = false
      const t = elapsed / SIGNAL_TRAVEL_DURATION
      sphere.position.lerpVectors(fromV, toV, t)
      if (sphereMaterialRef.current) {
        sphereMaterialRef.current.opacity = t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.15)
      }
      return
    }

    sphere.visible = false
    const pulseElapsed = elapsed - SIGNAL_TRAVEL_DURATION
    if (pulseElapsed <= SIGNAL_PULSE_DURATION) {
      pulse.visible = true
      pulse.position.copy(toV)
      const t = pulseElapsed / SIGNAL_PULSE_DURATION
      pulse.scale.setScalar(1 + t * 1.6)
      if (pulseMaterialRef.current) pulseMaterialRef.current.opacity = Math.max(0, 0.7 * (1 - t))
    } else {
      pulse.visible = false
      doneRef.current = true
    }
  })

  if (reduced) return null

  return (
    <>
      <mesh ref={sphereRef} visible={false}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          ref={sphereMaterialRef}
          color={SECURITY_COLOR.active}
          emissive={SECURITY_COLOR.active}
          emissiveIntensity={0.8}
          transparent
          opacity={1}
        />
      </mesh>
      <mesh ref={pulseRef} visible={false}>
        <torusGeometry args={[0.08, 0.01, 8, 24]} />
        <meshStandardMaterial
          ref={pulseMaterialRef}
          color={SECURITY_COLOR.active}
          emissive={SECURITY_COLOR.active}
          emissiveIntensity={0.9}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  )
}

export function SecurityScan({ reduced }: { reduced: boolean }) {
  return (
    <>
      <ScanArc reduced={reduced} />
      <IncomingSignal reduced={reduced} />
    </>
  )
}
