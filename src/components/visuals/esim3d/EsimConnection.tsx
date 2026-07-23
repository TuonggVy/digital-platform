import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Line2 } from 'three-stdlib'
import { VISUAL_COLOR } from '../shared/palette'
import { TravelingPulse, RingPulse as SharedRingPulse } from '../shared/DataPulse'
import type { StatusLightHandle } from '../shared/StatusLight'
import { PROFILE_ATTACH_POINT } from './EsimProfile'
import { PHONE_ACTIVATION_MARKER } from './EsimPhone'

const LINE_FADE_DELAY = 0.55
const LINE_FADE_DURATION = 0.25
export const PACKET_START_DELAY = 0.8
export const PACKET_DURATION = 0.5
const RING_PULSE_DELAY = PACKET_START_DELAY + PACKET_DURATION + 0.15
const RING_PULSE_DURATION = 0.7

interface EsimConnectionProps {
  reduced: boolean
  /** The phone's screen-dot StatusLight handle — flashed once the ring pulse lands, for a real
   *  "screen responds" glow beyond the dot's initial pop-in. */
  screenDotHandleRef?: RefObject<StatusLightHandle | null>
}

/** One short cyan bridge between the eSIM profile and the phone's activation marker — a gentle
 *  bend, not a route. Fades in once, then carries one packet (shared `TravelingPulse`) and one
 *  ring pulse (shared `RingPulse`), both one-time; the ring pulse's completion flashes the
 *  phone's screen dot. */
export function EsimConnection({ reduced, screenDotHandleRef }: EsimConnectionProps) {
  const lineRef = useRef<Line2>(null!)
  const settledRef = useRef(reduced)
  const flashedRef = useRef(false)

  const points = useMemo(() => {
    const from = new THREE.Vector3(...PROFILE_ATTACH_POINT)
    const to = new THREE.Vector3(...PHONE_ACTIVATION_MARKER)
    const bend = from.clone().lerp(to, 0.5)
    bend.z = Math.max(from.z, to.z) + 0.1
    return [from, bend, to]
  }, [])

  useFrame((state) => {
    if (settledRef.current || !lineRef.current) return
    const elapsed = Math.max(0, state.clock.elapsedTime - LINE_FADE_DELAY)
    const t = Math.min(1, elapsed / LINE_FADE_DURATION)
    lineRef.current.material.opacity = t * 0.85
    if (t >= 1) settledRef.current = true
  })

  const handleRingUpdate = (t: number) => {
    if (!flashedRef.current && t >= 0.92) {
      flashedRef.current = true
      screenDotHandleRef?.current?.flash()
    }
  }

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        color={VISUAL_COLOR.active}
        lineWidth={1.6}
        transparent
        opacity={reduced ? 0.85 : 0}
      />
      {!reduced && (
        <TravelingPulse
          points={points}
          startDelay={PACKET_START_DELAY}
          duration={PACKET_DURATION}
          radius={0.022}
          reduced={reduced}
        />
      )}
      {!reduced && (
        <SharedRingPulse
          position={PHONE_ACTIVATION_MARKER}
          startDelay={RING_PULSE_DELAY}
          duration={RING_PULSE_DURATION}
          maxScale={3.4}
          baseOpacity={0.55}
          tube={0.008}
          ringRadius={0.045}
          reduced={reduced}
          onUpdate={handleRingUpdate}
        />
      )}
    </>
  )
}
