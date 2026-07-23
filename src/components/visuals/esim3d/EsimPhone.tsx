import { forwardRef, useRef, type RefObject } from 'react'
import { QuadraticBezierLine, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'
import { VISUAL_COLOR } from '../shared/palette'
import { useEntryReveal } from '../shared/animation'
import { FloatingGroup } from '../shared/FloatingGroup'
import { StatusLight, type StatusLightHandle } from '../shared/StatusLight'

export const PHONE_ACTIVATION_MARKER: [number, number, number] = [0.42, 0.55, 0.045]

const SCREEN_W = 0.82
const SCREEN_H = 1.55
const SCREEN_Y = 0.06
const SCREEN_Z = 0.046
const BEZEL_T = 0.026

// Low-opacity, low-intensity emissive material dedicated to the abstract on-screen UI — kept
// local to this file (module scope, not the shared `visualMaterials.active` singleton) because
// its whole point is to read as "quietly alive", far dimmer than the shared active material used
// for status lights/pulses elsewhere in the scene.
const screenUIMaterial = new THREE.MeshStandardMaterial({
  color: VISUAL_COLOR.active,
  emissive: new THREE.Color(VISUAL_COLOR.active),
  emissiveIntensity: 0.4,
  transparent: true,
  opacity: 0.45,
  roughness: 0.35,
  metalness: 0.08,
})

const SIGNAL_BAR_HEIGHTS = [0.03, 0.05, 0.07, 0.09]

const NODE_A: [number, number, number] = [-0.16, 0.4, SCREEN_Z + 0.003]
const NODE_B: [number, number, number] = [0.14, 0.08, SCREEN_Z + 0.003]
const NODE_C: [number, number, number] = [-0.02, -0.3, SCREEN_Z + 0.003]
const ROUTE_MID: [number, number, number] = [
  (NODE_A[0] + NODE_B[0]) / 2,
  (NODE_A[1] + NODE_B[1]) / 2 + 0.08,
  SCREEN_Z + 0.0028,
]

interface EsimPhoneProps {
  reduced: boolean
  connectDelay: number
  /** Lets `EsimConnection` trigger a brief brighten on the screen dot once its ring pulse lands —
   *  a real glow-response beyond the initial pop-in. */
  screenDotHandleRef?: RefObject<StatusLightHandle | null>
  children?: never
}

/** The large, centered, dominant object — an abstract phone, never a branded device or fake UI.
 *  The outer group's one-time focus-in (scale 0.94 -> 1) is driven by the Scene's shared entrance
 *  timeline; only the screen dot / status light / activation marker's own pop-in (at
 *  `connectDelay`) is animated locally here. */
export const EsimPhone = forwardRef<THREE.Group, EsimPhoneProps>(function EsimPhone(
  { reduced, connectDelay, screenDotHandleRef },
  ref,
) {
  const screenDotGroupRef = useRef<THREE.Group>(null!)
  const topStatusGroupRef = useRef<THREE.Group>(null!)
  const markerGroupRef = useRef<THREE.Group>(null!)

  useEntryReveal(screenDotGroupRef, { delay: connectDelay, duration: 0.35, reduced })
  useEntryReveal(topStatusGroupRef, { delay: connectDelay, duration: 0.35, reduced })
  useEntryReveal(markerGroupRef, { delay: connectDelay, duration: 0.35, reduced })

  return (
    <group ref={ref}>
      <FloatingGroup reduced={reduced} bobAmplitude={0.045} bobPeriod={5.2} tiltAmplitude={0.03} phase={0}>
        <RoundedBox args={[1.0, 1.9, 0.08]} radius={0.09} smoothness={3} material={visualMaterials.metal} />

        {/* thin bezel/rim outline around the screen, so the glass doesn't look glued flush onto
            the front face */}
        <group position={[0, 0, 0.043]}>
          <mesh position={[0, SCREEN_Y + SCREEN_H / 2 + BEZEL_T / 2, 0]} material={visualMaterials.metal}>
            <boxGeometry args={[SCREEN_W + BEZEL_T * 2, BEZEL_T, 0.006]} />
          </mesh>
          <mesh position={[0, SCREEN_Y - SCREEN_H / 2 - BEZEL_T / 2, 0]} material={visualMaterials.metal}>
            <boxGeometry args={[SCREEN_W + BEZEL_T * 2, BEZEL_T, 0.006]} />
          </mesh>
          <mesh position={[-SCREEN_W / 2 - BEZEL_T / 2, SCREEN_Y, 0]} material={visualMaterials.metal}>
            <boxGeometry args={[BEZEL_T, SCREEN_H, 0.006]} />
          </mesh>
          <mesh position={[SCREEN_W / 2 + BEZEL_T / 2, SCREEN_Y, 0]} material={visualMaterials.metal}>
            <boxGeometry args={[BEZEL_T, SCREEN_H, 0.006]} />
          </mesh>
        </group>

        {/* small speaker/camera detail near the top edge of the frame */}
        <mesh position={[0, 0.9, 0.043]} rotation={[0, 0, Math.PI / 2]} material={visualMaterials.metal}>
          <capsuleGeometry args={[0.012, 0.12, 4, 8]} />
        </mesh>

        {/* screen glass — one of the few surfaces transmission is justified for */}
        <mesh position={[0, SCREEN_Y, SCREEN_Z]} material={visualMaterials.glass}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        </mesh>

        {/* abstract, minimal screen UI — no text, no fine print */}
        <group>
          {/* coverage arcs */}
          <mesh position={[-0.06, 0.32, SCREEN_Z + 0.001]} rotation={[0, 0, 0.3]} material={screenUIMaterial}>
            <torusGeometry args={[0.22, 0.006, 8, 32, Math.PI * 1.3]} />
          </mesh>
          <mesh position={[0.09, -0.12, SCREEN_Z + 0.0015]} rotation={[0, 0, -0.7]} material={screenUIMaterial}>
            <torusGeometry args={[0.15, 0.005, 8, 32, Math.PI * 1.05]} />
          </mesh>

          {/* signal-indicator bars, ascending, corner of the screen */}
          {SIGNAL_BAR_HEIGHTS.map((h, i) => (
            <mesh
              key={i}
              position={[-0.32 + i * 0.045, -0.62 + h / 2, SCREEN_Z + 0.002]}
              material={screenUIMaterial}
            >
              <boxGeometry args={[0.03, h, 0.004]} />
            </mesh>
          ))}

          {/* location nodes */}
          <mesh position={NODE_A} material={screenUIMaterial}>
            <sphereGeometry args={[0.018, 10, 10]} />
          </mesh>
          <mesh position={NODE_B} material={screenUIMaterial}>
            <sphereGeometry args={[0.018, 10, 10]} />
          </mesh>
          <mesh position={NODE_C} material={screenUIMaterial}>
            <sphereGeometry args={[0.015, 10, 10]} />
          </mesh>

          {/* one roaming-route, thin curved line connecting two of the location nodes */}
          <QuadraticBezierLine
            start={NODE_A}
            end={NODE_B}
            mid={ROUTE_MID}
            color={VISUAL_COLOR.active}
            lineWidth={1}
            transparent
            opacity={0.4}
          />
        </group>

        {/* screen dot — flashes when the transfer packet arrives */}
        <group ref={screenDotGroupRef} position={[0, SCREEN_Y, SCREEN_Z + 0.004]}>
          <StatusLight radius={0.035} handleRef={screenDotHandleRef} />
        </group>

        {/* status light near the top edge */}
        <group ref={topStatusGroupRef} position={[0, 0.82, 0.045]}>
          <StatusLight radius={0.022} />
        </group>

        {/* eSIM activation marker on the upper-right edge — where the connection attaches */}
        <group position={PHONE_ACTIVATION_MARKER}>
          <mesh material={visualMaterials.edge}>
            <torusGeometry args={[0.045, 0.008, 8, 24]} />
          </mesh>
          <group ref={markerGroupRef}>
            <StatusLight radius={0.022} />
          </group>
        </group>
      </FloatingGroup>
    </group>
  )
})

EsimPhone.displayName = 'EsimPhone'
