import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'

export interface RootRigProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  rotZ?: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  children: ReactNode
}

/** Reads the scroll+pointer-driven motion values via .get() inside useFrame and lerps the
 *  group's real transform directly — no React state, no re-render, on every tick. Shared by all
 *  three product scenes (cloud3d/security3d/esim3d); `rotZ` is optional since the Cloud scene
 *  doesn't use a Z tilt. */
export function RootRig({ rotY, rotX, rotZ, scale, reduced, children }: RootRigProps) {
  const ref = useRef<THREE.Group>(null!)

  useFrame(() => {
    const group = ref.current
    if (!group) return
    const targetY = THREE.MathUtils.degToRad(rotY.get())
    const targetX = THREE.MathUtils.degToRad(rotX.get())
    const targetScale = scale.get()
    const lerpFactor = reduced ? 1 : 0.1
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, lerpFactor)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, lerpFactor)
    if (rotZ) {
      const targetZ = THREE.MathUtils.degToRad(rotZ.get())
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetZ, lerpFactor)
    }
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, lerpFactor))
  })

  return <group ref={ref}>{children}</group>
}
