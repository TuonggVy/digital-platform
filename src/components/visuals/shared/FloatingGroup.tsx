import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface FloatingGroupProps {
  children: ReactNode
  position?: [number, number, number]
  /** Vertical bob amplitude, world units. */
  bobAmplitude?: number
  /** Bob period, seconds. */
  bobPeriod?: number
  /** Tilt amplitude, radians. */
  tiltAmplitude?: number
  /** Phase offset (radians) so siblings don't move in lockstep. */
  phase?: number
  reduced: boolean
}

/** Continuous, very small idle float — a slow Y bob plus a slight tilt, phase-shifted per
 *  instance so a group of these (cloud modules, endpoint devices, phone + chip) drifts out of
 *  sync with each other rather than breathing in unison. Freezes under reduced motion. */
export function FloatingGroup({
  children,
  position = [0, 0, 0],
  bobAmplitude = 0.035,
  bobPeriod = 5,
  tiltAmplitude = 0.02,
  phase = 0,
  reduced,
}: FloatingGroupProps) {
  const ref = useRef<THREE.Group>(null!)
  const basePosition = position

  useFrame((state) => {
    const group = ref.current
    if (!group || reduced) return
    const t = state.clock.elapsedTime * ((Math.PI * 2) / bobPeriod) + phase
    group.position.y = basePosition[1] + Math.sin(t) * bobAmplitude
    group.rotation.z = Math.sin(t * 0.7) * tiltAmplitude
    group.rotation.x = Math.cos(t * 0.5) * tiltAmplitude * 0.6
  })

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}
