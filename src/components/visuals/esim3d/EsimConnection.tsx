import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Line2 } from 'three-stdlib'
import { ESIM_COLOR } from './esimMaterials'
import { PROFILE_ATTACH_POINT } from './EsimProfile'
import { PHONE_ACTIVATION_MARKER } from './EsimPhone'

const LINE_FADE_DELAY = 0.55
const LINE_FADE_DURATION = 0.25
export const PACKET_START_DELAY = 0.8
export const PACKET_DURATION = 0.5
const RING_PULSE_DELAY = PACKET_START_DELAY + PACKET_DURATION + 0.15

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

/** One packet, traveling the short bridge once from the eSIM profile to the phone — never loops. */
function TransferPacket({ points }: { points: THREE.Vector3[] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const doneRef = useRef(false)

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || doneRef.current) return
    const elapsed = state.clock.elapsedTime - PACKET_START_DELAY
    if (elapsed < 0) {
      mesh.visible = false
      return
    }
    mesh.visible = true
    const t = Math.min(1, elapsed / PACKET_DURATION)
    mesh.position.copy(pointAtT(points, t))
    if (materialRef.current) {
      materialRef.current.opacity = t > 0.85 ? Math.max(0, 1 - (t - 0.85) / 0.15) : 1
    }
    if (t >= 1) {
      doneRef.current = true
      mesh.visible = false
    }
  })

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.022, 12, 12]} />
      <meshStandardMaterial
        ref={materialRef}
        color={ESIM_COLOR.active}
        emissive={ESIM_COLOR.active}
        emissiveIntensity={0.8}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

/** One restrained signal ring at the phone's activation marker — fires once after the packet arrives. */
function RingPulse() {
  const ref = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const doneRef = useRef(false)

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh || doneRef.current) return
    const elapsed = state.clock.elapsedTime - RING_PULSE_DELAY
    if (elapsed < 0) {
      mesh.visible = false
      return
    }
    mesh.visible = true
    const t = Math.min(1, elapsed / 0.7)
    mesh.scale.setScalar(1 + t * 2.4)
    if (materialRef.current) materialRef.current.opacity = Math.max(0, 0.55 * (1 - t))
    if (t >= 1) {
      doneRef.current = true
      mesh.visible = false
    }
  })

  return (
    <mesh ref={ref} position={PHONE_ACTIVATION_MARKER} visible={false}>
      <torusGeometry args={[0.045, 0.008, 8, 24]} />
      <meshStandardMaterial
        ref={materialRef}
        color={ESIM_COLOR.active}
        emissive={ESIM_COLOR.active}
        emissiveIntensity={0.7}
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

interface EsimConnectionProps {
  reduced: boolean
}

/** One short cyan bridge between the eSIM profile and the phone's activation marker — a gentle
 *  bend, not a route. Fades in once, then carries one packet and one ring pulse, both one-time. */
export function EsimConnection({ reduced }: EsimConnectionProps) {
  const lineRef = useRef<Line2>(null!)
  const settledRef = useRef(reduced)

  const points = useMemo(() => {
    const from = new THREE.Vector3(...PROFILE_ATTACH_POINT)
    const to = new THREE.Vector3(...PHONE_ACTIVATION_MARKER)
    const bend = from.clone().lerp(to, 0.5)
    bend.z = Math.max(from.z, to.z) + 0.1
    return [from, bend, to]
  }, [])

  useFrame((state) => {
    if (settledRef.current || !lineRef.current) return
    const elapsed = Math.max(0, state.clock.elapsedTime - LINE_FADE_DELAY)
    const t = Math.min(1, elapsed / LINE_FADE_DURATION)
    lineRef.current.material.opacity = t * 0.85
    if (t >= 1) settledRef.current = true
  })

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        color={ESIM_COLOR.active}
        lineWidth={1.6}
        transparent
        opacity={reduced ? 0.85 : 0}
      />
      {!reduced && <TransferPacket points={points} />}
      {!reduced && <RingPulse />}
    </>
  )
}
