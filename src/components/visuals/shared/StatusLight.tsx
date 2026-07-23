import { useImperativeHandle, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VISUAL_COLOR } from './palette'

export interface StatusLightHandle {
  /** Briefly boosts emissive intensity then decays back to resting — used when a scan/pulse
   *  passes over this light. Safe to call repeatedly; a new flash simply restarts the decay. */
  flash: () => void
}

export interface StatusLightProps {
  radius?: number
  position?: [number, number, number]
  restingIntensity?: number
  flashIntensity?: number
  /** Ref to imperatively trigger `flash()` from a parent (e.g. a scan pulse sweeping past). */
  handleRef?: React.RefObject<StatusLightHandle | null>
}

/** Small emissive sphere shared by every module/device/phone status light. Supports an optional
 *  imperative `flash()` (via `handleRef`) so a scan pulse can brighten it momentarily without the
 *  parent needing its own material/ref bookkeeping. */
export function StatusLight({
  radius = 0.03,
  position = [0, 0, 0],
  restingIntensity = 1.1,
  flashIntensity = 2.4,
  handleRef,
}: StatusLightProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const flashUntilRef = useRef(0)
  const flashRequestedRef = useRef(false)
  const FLASH_DECAY = 0.5

  useImperativeHandle(
    handleRef,
    () => ({
      flash: () => {
        flashRequestedRef.current = true
      },
    }),
    [],
  )

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    if (flashRequestedRef.current) {
      flashRequestedRef.current = false
      flashUntilRef.current = state.clock.elapsedTime + FLASH_DECAY
    }
    const flashUntil = flashUntilRef.current
    if (flashUntil > state.clock.elapsedTime) {
      const remaining = flashUntil - state.clock.elapsedTime
      const t = THREE.MathUtils.clamp(remaining / FLASH_DECAY, 0, 1)
      material.emissiveIntensity = THREE.MathUtils.lerp(restingIntensity, flashIntensity, t)
    } else if (material.emissiveIntensity !== restingIntensity) {
      material.emissiveIntensity = restingIntensity
    }
  })

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial
        ref={materialRef}
        color={VISUAL_COLOR.active}
        emissive={VISUAL_COLOR.active}
        emissiveIntensity={restingIntensity}
      />
    </mesh>
  )
}
