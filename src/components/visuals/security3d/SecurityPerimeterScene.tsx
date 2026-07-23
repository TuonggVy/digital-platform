import { createRef, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { RootRig } from '../shared/RootRig'
import { SceneLighting } from '../shared/SceneLighting'
import { SceneEnvironment } from '../shared/SceneEnvironment'
import { SceneEffects } from '../shared/SceneEffects'
import { useSceneEntranceTimeline } from '../shared/animation'
import type { StatusLightHandle } from '../shared/StatusLight'
import { SecurityShield } from './SecurityShield'
import { SecurityCore, SecurityRings, RING_A_RADIUS } from './SecurityRings'
import { SecurityScan, type SecurityScanDeviceEntry } from './SecurityScan'
import { ProtectedDevice, type ProtectedDeviceSpec } from './ProtectedDevice'

interface DeviceEntry {
  spec: ProtectedDeviceSpec
  delay: number
  phase: number
}

const DEVICE_ANGLES: { angle: number; kind: ProtectedDeviceSpec['kind']; delay: number; phase: number }[] = [
  { angle: 40, kind: 'laptop', delay: 0.1, phase: 0 },
  { angle: 130, kind: 'mobile', delay: 0.24, phase: 1.4 },
  { angle: 220, kind: 'tablet', delay: 0.38, phase: 2.9 },
  { angle: 310, kind: 'endpoint', delay: 0.52, phase: 4.3 },
]

// Devices sit just inside Ring A, at off-cardinal angles (not N/E/S/W) so the arrangement
// reads as "orderly and contained" rather than compass/radar-coded.
function buildDevices(spacingFactor: number): DeviceEntry[] {
  return DEVICE_ANGLES.map(({ angle, kind, delay, phase }) => ({
    spec: { kind, angleDeg: angle, radius: (RING_A_RADIUS - 0.12) * spacingFactor },
    delay,
    phase,
  }))
}

const CAMERA_DRIFT_AMPLITUDE_X = 0.05
const CAMERA_DRIFT_AMPLITUDE_Y = 0.04
const CAMERA_DRIFT_PERIOD_SECONDS = 10

/** A small continuous passive camera drift (never user-controlled — no OrbitControls) so the
 *  scene never looks perfectly frozen between scroll ticks. */
function CameraDrift({ reduced, inView }: { reduced: boolean; inView: boolean }) {
  const basePosition = useRef<{ x: number; y: number } | null>(null)

  useFrame((state) => {
    if (reduced || !inView) return
    if (!basePosition.current) {
      basePosition.current = { x: state.camera.position.x, y: state.camera.position.y }
    }
    const t = state.clock.elapsedTime
    const base = basePosition.current
    state.camera.position.x = base.x + Math.sin((t * Math.PI * 2) / CAMERA_DRIFT_PERIOD_SECONDS) * CAMERA_DRIFT_AMPLITUDE_X
    state.camera.position.y = base.y + Math.cos((t * Math.PI * 2) / CAMERA_DRIFT_PERIOD_SECONDS) * CAMERA_DRIFT_AMPLITUDE_Y
  })

  return null
}

interface SecurityCompositionProps {
  reduced: boolean
  compact: boolean
}

/** The shield/pedestal/rings/devices/scan composition, plus the one-shot entrance timeline that
 *  staggers the shield and the four devices in. */
function SecurityComposition({ reduced, compact }: SecurityCompositionProps) {
  const devices = useMemo(() => buildDevices(compact ? 0.82 : 1), [compact])

  const shieldRef = useRef<THREE.Group>(null!)
  const deviceRefs = useMemo(() => devices.map(() => createRef<THREE.Group>()), [devices])
  const statusHandleRefs = useMemo(() => devices.map(() => createRef<StatusLightHandle>()), [devices])

  useSceneEntranceTimeline(
    [
      { ref: shieldRef, delay: 0 },
      ...devices.map((device, index) => ({ ref: deviceRefs[index], delay: device.delay })),
    ],
    reduced,
  )

  const scanDevices: SecurityScanDeviceEntry[] = devices.map((device, index) => ({
    radius: device.spec.radius,
    handleRef: statusHandleRefs[index],
  }))

  return (
    <>
      <SecurityShield ref={shieldRef} reduced={reduced} />
      <SecurityCore />
      <SecurityRings reduced={reduced} />
      {devices.map((device, index) => (
        <ProtectedDevice
          key={device.spec.kind}
          ref={deviceRefs[index]}
          spec={device.spec}
          phase={device.phase}
          reduced={reduced}
          statusHandleRef={statusHandleRefs[index]}
        />
      ))}
      <SecurityScan reduced={reduced} devices={scanDevices} />
    </>
  )
}

export interface SecurityPerimeterSceneProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  rotZ: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  compact: boolean
  inView: boolean
}

/** The lazy-loaded chunk: Canvas, lights, camera, and the shield/core/rings/device/scan
 *  composition. */
export default function SecurityPerimeterScene({
  rotY,
  rotX,
  rotZ,
  scale,
  reduced,
  compact,
  inView,
}: SecurityPerimeterSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.4, 7.2], fov: 30 }}
      style={{ background: 'transparent' }}
      frameloop={reduced ? 'demand' : inView ? 'always' : 'never'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
      }}
    >
      <SceneLighting violetRim />
      <SceneEnvironment />
      <CameraDrift reduced={reduced} inView={inView} />
      <RootRig rotY={rotY} rotX={rotX} rotZ={rotZ} scale={scale} reduced={reduced}>
        <SecurityComposition reduced={reduced} compact={compact} />
        <ContactShadows
          position={[0, -0.62, 0]}
          opacity={0.28}
          blur={2.6}
          far={1.6}
          scale={4.2}
          color="#03101f"
        />
      </RootRig>
      <SceneEffects enabled={!compact} />
    </Canvas>
  )
}
