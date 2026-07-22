import { useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { SecurityCore, SecurityRings, pointOnRingA, RING_A_RADIUS } from './SecurityRings'
import { SecurityScan } from './SecurityScan'
import { ProtectedDevice, type ProtectedDeviceSpec } from './ProtectedDevice'

interface DeviceEntry extends ProtectedDeviceSpec {
  delay: number
}

const DEVICE_ANGLES: { angle: number; kind: ProtectedDeviceSpec['kind']; delay: number }[] = [
  { angle: 40, kind: 'laptop', delay: 0.1 },
  { angle: 130, kind: 'mobile', delay: 0.24 },
  { angle: 220, kind: 'tablet', delay: 0.38 },
  { angle: 310, kind: 'endpoint', delay: 0.52 },
]

// Devices sit just inside Ring A, at off-cardinal angles (not N/E/S/W) so the arrangement
// reads as "orderly and contained" rather than compass/radar-coded.
function buildDevices(spacingFactor: number): DeviceEntry[] {
  return DEVICE_ANGLES.map(({ angle, kind, delay }) => ({
    kind,
    position: pointOnRingA(angle, (RING_A_RADIUS - 0.12) * spacingFactor),
    rotation: [0, -THREE.MathUtils.degToRad(angle), 0],
    delay,
  }))
}

interface RootRigProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  rotZ: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  children: ReactNode
}

/** Reads the scroll-driven motion values via .get() inside useFrame and lerps the group's real
 *  transform directly — no React state, no re-render, on every scroll tick. */
function RootRig({ rotY, rotX, rotZ, scale, reduced, children }: RootRigProps) {
  const ref = useRef<THREE.Group>(null!)

  useFrame(() => {
    const group = ref.current
    if (!group) return
    const targetY = THREE.MathUtils.degToRad(rotY.get())
    const targetX = THREE.MathUtils.degToRad(rotX.get())
    const targetZ = THREE.MathUtils.degToRad(rotZ.get())
    const targetScale = scale.get()
    const lerpFactor = reduced ? 1 : 0.1
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, lerpFactor)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, lerpFactor)
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetZ, lerpFactor)
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, lerpFactor))
  })

  return <group ref={ref}>{children}</group>
}

export interface SecurityPerimeterSceneProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  rotZ: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  compact: boolean
}

/** The lazy-loaded chunk: Canvas, lights, camera, and the core/rings/device/scan composition. */
export default function SecurityPerimeterScene({ rotY, rotX, rotZ, scale, reduced, compact }: SecurityPerimeterSceneProps) {
  const devices = buildDevices(compact ? 0.82 : 1)

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.4, 7.2], fov: 30 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -1, -3]} intensity={0.3} color="#3fa9dd" />
      <RootRig rotY={rotY} rotX={rotX} rotZ={rotZ} scale={scale} reduced={reduced}>
        <SecurityCore />
        <SecurityRings />
        {devices.map((d) => (
          <ProtectedDevice key={d.kind} spec={d} delay={d.delay} reduced={reduced} />
        ))}
        <SecurityScan reduced={reduced} />
      </RootRig>
    </Canvas>
  )
}
