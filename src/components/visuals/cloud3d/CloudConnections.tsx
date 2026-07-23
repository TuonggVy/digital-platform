import { useMemo } from 'react'
import { QuadraticBezierLine } from '@react-three/drei'
import * as THREE from 'three'
import { VISUAL_COLOR } from '../shared/palette'
import { TravelingPulse } from '../shared/DataPulse'

export interface ConnectionSpec {
  from: [number, number, number]
  to: [number, number, number]
}

interface ConnectionPath {
  start: THREE.Vector3
  end: THREE.Vector3
  control: THREE.Vector3
  points: THREE.Vector3[]
}

/** A gentle arc (not a right angle) between core and module: control point is the midpoint nudged
 *  up and slightly forward. `getPoints` also gives `TravelingPulse` a point array to sample. */
function buildPath(from: [number, number, number], to: [number, number, number]): ConnectionPath {
  const start = new THREE.Vector3(...from)
  const end = new THREE.Vector3(...to)
  const control = start
    .clone()
    .add(end)
    .multiplyScalar(0.5)
    .add(new THREE.Vector3(0, 0.35, 0.15))
  const curve = new THREE.QuadraticBezierCurve3(start, control, end)
  return { start, end, control, points: curve.getPoints(24) }
}

const PULSE_STAGGER = 0.9
const PULSE_DURATION = 1.1
const PULSE_CYCLE_GAP = 3.5

export interface CloudConnectionsProps {
  connections: ConnectionSpec[]
  reduced: boolean
}

/** Structured core->module arcs, each dimmer the farther it sits from the core, plus one looping
 *  traveling pulse per connection (staggered so at most ~2 are visible across all five at once). */
export function CloudConnections({ connections, reduced }: CloudConnectionsProps) {
  const paths = useMemo(() => connections.map((c) => buildPath(c.from, c.to)), [connections])

  const opacities = useMemo(() => {
    const lengths = paths.map((p) => p.start.distanceTo(p.end))
    const min = Math.min(...lengths)
    const max = Math.max(...lengths)
    const span = Math.max(0.0001, max - min)
    return lengths.map((len) => THREE.MathUtils.lerp(0.55, 0.22, (len - min) / span))
  }, [paths])

  return (
    <>
      {paths.map((path, i) => (
        <group key={i}>
          <QuadraticBezierLine
            start={path.start}
            end={path.end}
            mid={path.control}
            color={VISUAL_COLOR.edge}
            lineWidth={1.1}
            transparent
            opacity={opacities[i]}
          />
          <TravelingPulse
            points={path.points}
            startDelay={i * PULSE_STAGGER}
            duration={PULSE_DURATION}
            loop
            cycleGap={PULSE_CYCLE_GAP}
            reduced={reduced}
          />
        </group>
      ))}
    </>
  )
}
