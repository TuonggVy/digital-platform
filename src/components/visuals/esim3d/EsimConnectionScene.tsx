import { useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { EsimPhone } from './EsimPhone'
import { EsimProfile } from './EsimProfile'
import { EsimConnection, PACKET_START_DELAY, PACKET_DURATION } from './EsimConnection'

const CONNECT_DELAY = PACKET_START_DELAY + PACKET_DURATION

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

export interface EsimConnectionSceneProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  rotZ: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  compact: boolean
}

/** The lazy-loaded chunk: Canvas, lights, camera, and the phone/eSIM/connection composition. */
export default function EsimConnectionScene({ rotY, rotX, rotZ, scale, reduced }: EsimConnectionSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.05, 5.9], fov: 30 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -1, -3]} intensity={0.3} color="#3fa9dd" />
      <RootRig rotY={rotY} rotX={rotX} rotZ={rotZ} scale={scale} reduced={reduced}>
        <EsimPhone reduced={reduced} connectDelay={CONNECT_DELAY} />
        <EsimProfile reduced={reduced} />
        <EsimConnection reduced={reduced} />
      </RootRig>
    </Canvas>
  )
}
