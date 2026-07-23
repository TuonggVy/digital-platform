import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'
import { VISUAL_COLOR } from '../shared/palette'
import { RingPulse } from '../shared/DataPulse'
import type { StatusLightHandle } from '../shared/StatusLight'
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
        <mesh material={visualMaterials.active}>
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
          color={VISUAL_COLOR.active}
          emissive={VISUAL_COLOR.active}
          emissiveIntensity={0.8}
          transparent
          opacity={1}
        />
      </mesh>
      <mesh ref={pulseRef} visible={false}>
        <torusGeometry args={[0.08, 0.01, 8, 24]} />
        <meshStandardMaterial
          ref={pulseMaterialRef}
          color={VISUAL_COLOR.active}
          emissive={VISUAL_COLOR.active}
          emissiveIntensity={0.9}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  )
}

export interface SecurityScanDeviceEntry {
  /** Orbital radius this device sits at (matches the `radius` passed to its `ProtectedDevice`). */
  radius: number
  /** Flashed once per pulse cycle, the moment the expanding ring's radius sweeps past it. */
  handleRef: RefObject<StatusLightHandle | null>
}

const PULSE_RING_RADIUS = 0.1
const PULSE_MAX_SCALE = (RING_A_RADIUS + 0.3) / PULSE_RING_RADIUS
const PULSE_DURATION = 3
const PULSE_CYCLE_GAP = 5
const PULSE_START_DELAY = 2.2

/** The continuous "protection pulse" — a ring expanding out from the core on a slow repeat-with-
 *  rest cycle (~8s total: 3s expanding + 5s resting), sweeping past the perimeter and each
 *  endpoint's orbital radius in turn. Flashes a device's `StatusLight` once per cycle, the moment
 *  the pulse's growing radius first reaches that device's radius. */
function ProtectionPulse({ reduced, devices }: { reduced: boolean; devices: SecurityScanDeviceEntry[] }) {
  const flashedRef = useRef<boolean[]>(devices.map(() => false))

  const handleUpdate = (t: number) => {
    if (t < 0.02) {
      flashedRef.current = devices.map(() => false)
    }
    const currentRadius = PULSE_RING_RADIUS * (1 + t * (PULSE_MAX_SCALE - 1))
    devices.forEach((device, index) => {
      if (!flashedRef.current[index] && currentRadius >= device.radius) {
        flashedRef.current[index] = true
        device.handleRef.current?.flash()
      }
    })
  }

  return (
    <RingPulse
      position={[0, 0, 0]}
      rotation={RING_A_TILT}
      startDelay={PULSE_START_DELAY}
      duration={PULSE_DURATION}
      maxScale={PULSE_MAX_SCALE}
      ringRadius={PULSE_RING_RADIUS}
      tube={0.012}
      baseOpacity={0.5}
      loop
      cycleGap={PULSE_CYCLE_GAP}
      reduced={reduced}
      onUpdate={handleUpdate}
    />
  )
}

export interface SecurityScanProps {
  reduced: boolean
  devices: SecurityScanDeviceEntry[]
}

/** ScanArc (continuous monitoring), IncomingSignal (one-time activation cue), and ProtectionPulse
 *  (slow-cycling perimeter sweep that flashes each endpoint) composed together. */
export function SecurityScan({ reduced, devices }: SecurityScanProps) {
  return (
    <>
      <ScanArc reduced={reduced} />
      <IncomingSignal reduced={reduced} />
      <ProtectionPulse reduced={reduced} devices={devices} />
    </>
  )
}
