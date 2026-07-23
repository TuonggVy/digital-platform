import { forwardRef, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'
import { StatusLight } from '../shared/StatusLight'
import { FloatingGroup } from '../shared/FloatingGroup'

export interface CloudCoreProps {
  position: [number, number, number]
  reduced: boolean
}

const CORE_SIZE: [number, number, number] = [1.05, 0.95, 0.55]
const BAR_COUNT = 4

/** The scene's dedicated "cloud control core" — a single anchor separate from the five satellite
 *  modules. Dark metal frame, a genuine glass front, a handful of idle emissive bars behind the
 *  glass, restrained seam lines, and one status light. Owns no entrance timing itself: the Scene
 *  drives the one-shot pop-in externally via the forwarded ref + `useSceneEntranceTimeline`. */
export const CloudCore = forwardRef<THREE.Group, CloudCoreProps>(function CloudCore({ position, reduced }, ref) {
  const [w, h, d] = CORE_SIZE
  const barMeshRefs = useRef<(THREE.Mesh | null)[]>([])

  // The bars need independent, continuously-animated emissive intensity (phase-offset per bar),
  // so each gets its own material clone rather than mutating the shared `visualMaterials.active`
  // singleton in place — that singleton is reused by every scene, and writing to it per-frame here
  // would make unrelated status lights/details elsewhere flicker in lockstep with these bars.
  const barMaterials = useMemo(() => Array.from({ length: BAR_COUNT }, () => visualMaterials.active.clone()), [])

  const barX = useMemo(() => {
    const usable = w * 0.6
    return Array.from({ length: BAR_COUNT }, (_, i) => -usable / 2 + (usable / (BAR_COUNT - 1)) * i)
  }, [w])

  useFrame((state) => {
    if (reduced) return
    const t = state.clock.elapsedTime
    barMeshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const wave = Math.sin(t * 1.4 + i * 1.3) * 0.5 + 0.5
      mesh.scale.y = 0.5 + wave * 0.5
      barMaterials[i].emissiveIntensity = 0.6 + wave * 0.9
    })
  })

  return (
    <group ref={ref} position={position}>
      <FloatingGroup reduced={reduced} bobAmplitude={0.02} bobPeriod={6.5} tiltAmplitude={0.012}>
        <RoundedBox args={[w, h, d]} radius={Math.min(w, h, d) * 0.08} smoothness={2} material={visualMaterials.metal} />

        {/* Idle emissive bars — sit just proud of the opaque metal body's front face (never
            inside it, or the opaque body would fully occlude them) and behind the glass pane. */}
        <group position={[0, -0.02, d / 2 + 0.015]}>
          {barX.map((x, i) => (
            <mesh
              key={i}
              ref={(el) => {
                barMeshRefs.current[i] = el
              }}
              position={[x, 0, 0]}
              material={barMaterials[i]}
            >
              <boxGeometry args={[w * 0.07, h * 0.5, 0.02]} />
            </mesh>
          ))}
        </group>

        {/* Dark glass front, proud of the bars so they read as sitting behind it. */}
        <mesh position={[0, 0, d / 2 + 0.04]} material={visualMaterials.glass}>
          <boxGeometry args={[w * 0.8, h * 0.8, 0.03]} />
        </mesh>

        {/* Restrained seam / panel-line details, on the bezel above/below the glass. */}
        <mesh position={[0, h * 0.43, d / 2 + 0.006]} material={visualMaterials.edge}>
          <boxGeometry args={[w * 0.9, 0.012, 0.01]} />
        </mesh>
        <mesh position={[0, -h * 0.43, d / 2 + 0.006]} material={visualMaterials.edge}>
          <boxGeometry args={[w * 0.9, 0.012, 0.01]} />
        </mesh>

        {/* Trim status light, on the bezel corner outside the glass footprint. */}
        <StatusLight position={[w * 0.42, h * 0.42, d / 2 + 0.008]} radius={0.032} />
      </FloatingGroup>
    </group>
  )
})
