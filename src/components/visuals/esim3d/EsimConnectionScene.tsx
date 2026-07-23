import { useRef } from 'react'
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
import { EsimPhone } from './EsimPhone'
import { EsimProfile } from './EsimProfile'
import { EsimCoverage } from './EsimCoverage'
import { EsimConnection, PACKET_START_DELAY, PACKET_DURATION } from './EsimConnection'

const CONNECT_DELAY = PACKET_START_DELAY + PACKET_DURATION

export interface EsimConnectionSceneProps {
  rotY: MotionValue<number>
  rotX: MotionValue<number>
  rotZ: MotionValue<number>
  scale: MotionValue<number>
  reduced: boolean
  compact: boolean
  inView: boolean
}

/** Small continuous camera drift so the scene never feels perfectly static — kept the most
 *  restrained of the three product visuals per spec (tiny amplitude), and stops entirely once out
 *  of view or under reduced motion. */
function CameraDrift({ reduced, inView }: { reduced: boolean; inView: boolean }) {
  const baseRef = useRef<{ x: number; y: number } | null>(null)

  useFrame((state) => {
    if (!baseRef.current) {
      baseRef.current = { x: state.camera.position.x, y: state.camera.position.y }
    }
    if (reduced || !inView) return
    const { x, y } = baseRef.current
    const t = state.clock.elapsedTime
    state.camera.position.x = x + Math.sin(t * 0.15) * 0.035
    state.camera.position.y = y + Math.sin(t * 0.11 + 1.3) * 0.03
  })

  return null
}

/** The lazy-loaded chunk: Canvas, lights, camera, and the phone/eSIM/connection composition. */
export default function EsimConnectionScene({
  rotY,
  rotX,
  rotZ,
  scale,
  reduced,
  compact,
  inView,
}: EsimConnectionSceneProps) {
  const phoneRef = useRef<THREE.Group>(null!)
  const profileRef = useRef<THREE.Group>(null!)
  const screenDotHandleRef = useRef<StatusLightHandle | null>(null)

  useSceneEntranceTimeline(
    [
      { ref: phoneRef, delay: 0, startScale: 0.94 },
      { ref: profileRef, delay: 0.12, startScale: 0 },
    ],
    reduced,
  )

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{ position: [0, 0.05, 5.9], fov: 30 }}
      style={{ background: 'transparent' }}
      frameloop={reduced ? 'demand' : inView ? 'always' : 'never'}
    >
      <SceneLighting />
      <SceneEnvironment />
      <SceneEffects enabled={!compact} />
      <CameraDrift reduced={reduced} inView={inView} />
      <RootRig rotY={rotY} rotX={rotX} rotZ={rotZ} scale={scale} reduced={reduced}>
        <EsimPhone
          ref={phoneRef}
          reduced={reduced}
          connectDelay={CONNECT_DELAY}
          screenDotHandleRef={screenDotHandleRef}
        />
        <EsimProfile ref={profileRef} reduced={reduced} />
        <EsimCoverage reduced={reduced} compact={compact} />
        <EsimConnection reduced={reduced} screenDotHandleRef={screenDotHandleRef} />
        <ContactShadows
          position={[0, -0.98, 0]}
          opacity={0.3}
          blur={2.6}
          far={2.2}
          scale={3}
          frames={1}
          color="#04101c"
        />
      </RootRig>
    </Canvas>
  )
}
