import { forwardRef, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'
import { useEntryReveal } from '../shared/animation'
import { FloatingGroup } from '../shared/FloatingGroup'
import { StatusLight } from '../shared/StatusLight'

export const PROFILE_POSITION: [number, number, number] = [0.82, 0.58, -0.22]
export const PROFILE_ATTACH_POINT: [number, number, number] = [0.7, 0.48, -0.2]

const ACTIVATE_DELAY = 0.35

interface EsimProfileProps {
  reduced: boolean
  children?: never
}

interface ContactPad {
  position: [number, number, number]
  size: [number, number, number]
}

// A real SIM chip's contact pad grid — a few parallel gold rectangles plus one perpendicular
// connector — rather than the old two flat grey stripes.
const CONTACT_PADS: ContactPad[] = [
  { position: [-0.03, 0.1, 0.017], size: [0.1, 0.018, 0.004] },
  { position: [0.06, 0.1, 0.017], size: [0.05, 0.018, 0.004] },
  { position: [0, 0.055, 0.017], size: [0.17, 0.016, 0.004] },
  { position: [-0.03, 0.01, 0.017], size: [0.1, 0.018, 0.004] },
  { position: [0.06, 0.01, 0.017], size: [0.05, 0.018, 0.004] },
  { position: [0, -0.03, 0.017], size: [0.018, 0.09, 0.004] },
]

/** The digital eSIM profile — a small rounded chip beside the phone, nudged slightly back in
 *  depth. The outer group's pop-in is driven by the Scene's shared entrance timeline; only the
 *  activation dot's own delayed pop-in is animated locally here. */
export const EsimProfile = forwardRef<THREE.Group, EsimProfileProps>(function EsimProfile({ reduced }, ref) {
  const dotGroupRef = useRef<THREE.Group>(null!)

  useEntryReveal(dotGroupRef, { delay: ACTIVATE_DELAY, duration: 0.3, reduced })

  return (
    <group ref={ref} position={PROFILE_POSITION} rotation={[0, THREE.MathUtils.degToRad(-12), 0]}>
      <FloatingGroup reduced={reduced} bobAmplitude={0.03} bobPeriod={4.2} tiltAmplitude={0.03} phase={Math.PI * 0.6}>
        <RoundedBox args={[0.26, 0.34, 0.03]} radius={0.035} smoothness={2} material={visualMaterials.edge} />

        {CONTACT_PADS.map((pad, i) => (
          <mesh key={i} position={pad.position} material={visualMaterials.contactGold}>
            <boxGeometry args={pad.size} />
          </mesh>
        ))}

        <group ref={dotGroupRef} position={[0, -0.12, 0.02]}>
          <StatusLight radius={0.024} />
        </group>
      </FloatingGroup>
    </group>
  )
})

EsimProfile.displayName = 'EsimProfile'
