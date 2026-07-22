import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { esimMaterials } from './esimMaterials'

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

const FOCUS_IN_DURATION = 0.3
const FOCUS_IN_START_SCALE = 0.94

export const PHONE_ACTIVATION_MARKER: [number, number, number] = [0.42, 0.55, 0.045]

interface EsimPhoneProps {
  reduced: boolean
  connectDelay: number
  children?: never
}

/** The large, centered, dominant object — an abstract phone, never a branded device or fake UI.
 *  Does a very subtle one-time focus-in (scale 0.94 → 1), then its status light and screen
 *  dot light up once the connection completes at `connectDelay`. */
export function EsimPhone({ reduced, connectDelay }: EsimPhoneProps) {
  const rootRef = useRef<THREE.Group>(null!)
  const focusSettledRef = useRef(reduced)
  const statusLightRef = useRef<THREE.Mesh>(null!)
  const screenDotRef = useRef<THREE.Mesh>(null!)
  const markerDotRef = useRef<THREE.Mesh>(null!)
  const activateSettledRef = useRef(reduced)

  useFrame((state) => {
    if (!focusSettledRef.current && rootRef.current) {
      const t = Math.min(1, state.clock.elapsedTime / FOCUS_IN_DURATION)
      const eased = easeOutCubic(t)
      const s = FOCUS_IN_START_SCALE + (1 - FOCUS_IN_START_SCALE) * eased
      rootRef.current.scale.setScalar(s)
      if (t >= 1) focusSettledRef.current = true
    }

    if (!activateSettledRef.current && statusLightRef.current && screenDotRef.current && markerDotRef.current) {
      const elapsed = Math.max(0, state.clock.elapsedTime - connectDelay)
      const t = Math.min(1, elapsed / 0.35)
      const eased = easeOutCubic(t)
      statusLightRef.current.scale.setScalar(eased)
      screenDotRef.current.scale.setScalar(eased)
      markerDotRef.current.scale.setScalar(eased)
      if (t >= 1) activateSettledRef.current = true
    }
  })

  return (
    <group ref={rootRef} scale={reduced ? 1 : FOCUS_IN_START_SCALE}>
      <RoundedBox args={[1.0, 1.9, 0.08]} radius={0.09} smoothness={3} material={esimMaterials.body} />

      {/* screen */}
      <mesh position={[0, 0.06, 0.045]} material={esimMaterials.panel}>
        <planeGeometry args={[0.82, 1.55]} />
      </mesh>
      <mesh ref={screenDotRef} position={[0, 0.06, 0.05]} material={esimMaterials.active} scale={reduced ? 1 : 0}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>

      {/* status light near the top edge */}
      <mesh ref={statusLightRef} position={[0, 0.82, 0.045]} material={esimMaterials.active} scale={reduced ? 1 : 0}>
        <sphereGeometry args={[0.022, 12, 12]} />
      </mesh>

      {/* eSIM activation marker on the upper-right edge — where the connection attaches */}
      <group position={PHONE_ACTIVATION_MARKER}>
        <mesh material={esimMaterials.edge}>
          <torusGeometry args={[0.045, 0.008, 8, 24]} />
        </mesh>
        <mesh ref={markerDotRef} material={esimMaterials.active} scale={reduced ? 1 : 0}>
          <sphereGeometry args={[0.022, 12, 12]} />
        </mesh>
      </group>
    </group>
  )
}
