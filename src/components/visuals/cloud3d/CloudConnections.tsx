import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { CLOUD_COLOR } from './cloudMaterials'

export interface ConnectionSpec {
  from: [number, number, number]
  to: [number, number, number]
}

/** One right-angle circuit trace (X leg, then Y leg, then Z leg) — the 3D version of
 *  CloudProductVisual's 2D bend-once trace(), so the two illustrations read as one family. */
function manhattanPoints(from: [number, number, number], to: [number, number, number]): [number, number, number][] {
  const bend1: [number, number, number] = [to[0], from[1], from[2]]
  const bend2: [number, number, number] = [to[0], to[1], from[2]]
  return [from, bend1, bend2, to]
}

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

interface DataPacketProps {
  points: THREE.Vector3[]
  startDelay: number
  duration: number
}

/** One small sphere traveling one connection once, then it disappears — never loops. */
function DataPacket({ points, startDelay, duration }: DataPacketProps) {
  const ref = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const doneRef = useRef(false)

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh || doneRef.current) return
    const elapsed = state.clock.elapsedTime - startDelay
    if (elapsed < 0) {
      mesh.visible = false
      return
    }
    mesh.visible = true
    const t = Math.min(1, elapsed / duration)
    mesh.position.copy(pointAtT(points, t))
    if (materialRef.current) {
      materialRef.current.opacity = t > 0.92 ? Math.max(0, 1 - (t - 0.92) / 0.08) : 1
    }
    if (t >= 1) {
      doneRef.current = true
      mesh.visible = false
    }
  })

  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial
        ref={materialRef}
        color={CLOUD_COLOR.active}
        emissive={CLOUD_COLOR.active}
        emissiveIntensity={0.8}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

interface CloudConnectionsProps {
  connections: ConnectionSpec[]
  packetTarget: [number, number, number]
  reduced: boolean
}

/** Structured core→module traces. Each gets a calm blue full path plus a short cyan leg leaving
 *  the core (restrained "active data" cue) — never a tangle, always core-to-module and back. */
export function CloudConnections({ connections, packetTarget, reduced }: CloudConnectionsProps) {
  const paths = useMemo(() => connections.map((c) => manhattanPoints(c.from, c.to)), [connections])

  const packetPath = useMemo(() => {
    const target = connections.find((c) => c.to.every((v, i) => v === packetTarget[i]))
    const raw = target ? manhattanPoints(target.from, target.to) : paths[0]
    return raw.map((p) => new THREE.Vector3(...p))
  }, [connections, packetTarget, paths])

  return (
    <>
      {paths.map((points, i) => (
        <group key={i}>
          <Line points={points} color={CLOUD_COLOR.edge} lineWidth={1.1} transparent opacity={0.4} />
          <Line points={points.slice(0, 2)} color={CLOUD_COLOR.active} lineWidth={1.5} transparent opacity={0.75} />
        </group>
      ))}
      {!reduced && <DataPacket points={packetPath} startDelay={1.3} duration={1.1} />}
    </>
  )
}
