import { forwardRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { visualMaterials } from '../shared/materials'

/** A generic, abstract shield outline — flat/rounded top corners, shoulders that bulge slightly
 *  wider just below the top before tapering smoothly to a bottom point. Never the Kaspersky mark,
 *  just classic badge/shield proportions. Centered on the origin, roughly 1.0 unit tall.
 *
 *  Deliberately NOT a rounded dome-on-a-stem: an early version used a semicircular top that
 *  narrowed almost immediately into a slim vertical body, which read as an abstract head/bust
 *  silhouette rather than a shield once extruded and lit. Keeping the top corners flat and
 *  pushing the widest point ("shoulders") to just below them avoids that misread. */
function buildShieldShape(): THREE.Shape {
  const shape = new THREE.Shape()
  const topY = 0.4
  const topHalfWidth = 0.33
  const cornerRadius = 0.05

  shape.moveTo(-topHalfWidth + cornerRadius, topY)
  shape.lineTo(topHalfWidth - cornerRadius, topY)
  shape.quadraticCurveTo(topHalfWidth, topY, topHalfWidth, topY - cornerRadius)
  // Right shoulder bulges out slightly wider than the top corner, then tapers to the bottom point.
  shape.bezierCurveTo(0.42, 0.22, 0.4, 0.02, 0.34, -0.12)
  shape.bezierCurveTo(0.28, -0.32, 0.16, -0.46, 0, -0.56)
  shape.bezierCurveTo(-0.16, -0.46, -0.28, -0.32, -0.34, -0.12)
  shape.bezierCurveTo(-0.4, 0.02, -0.42, 0.22, -topHalfWidth, topY - cornerRadius)
  shape.quadraticCurveTo(-topHalfWidth, topY, -topHalfWidth + cornerRadius, topY)
  shape.closePath()
  return shape
}

/** A smaller, scaled copy of the outline (sampled as a polygon) used for the recessed front
 *  face and the inner core glow, so both stay proportional to the outer rim. */
function innerShieldShape(scale: number): THREE.Shape {
  const points = buildShieldShape().getPoints(48)
  return new THREE.Shape(points.map((p) => p.clone().multiplyScalar(scale)))
}

const SHIELD_DEPTH = 0.16
const CORE_PULSE_PERIOD = 4.5

// Cloned once at module scope so the inner glow can pulse over time without mutating the shared
// `visualMaterials.active` singleton, which every scene's status lights/scan arc also reference.
const shieldCoreMaterial = visualMaterials.active.clone()

export interface SecurityShieldProps {
  reduced: boolean
}

/** The scene's centerpiece — a generic, abstract shield silhouette extruded for real thickness:
 *  a dark metal rim, a recessed dark-glass front face, and a small cyan-emissive core glowing
 *  just behind it (the "lớp lõi bên trong phát sáng xanh cyan" from the spec). Sits in front of
 *  `SecurityCore` (the pedestal/energy core it visually draws from). The outer group carries no
 *  entrance logic of its own — its one-shot pop-in is driven externally by the scene's
 *  `useSceneEntranceTimeline`. */
export const SecurityShield = forwardRef<THREE.Group, SecurityShieldProps>(function SecurityShield(
  { reduced },
  ref,
) {
  const outerGeometry = useMemo(() => {
    const shape = buildShieldShape()
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: SHIELD_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.016,
      bevelSegments: 3,
      curveSegments: 24,
    })
    geometry.translate(0, 0, -SHIELD_DEPTH / 2)
    return geometry
  }, [])

  const frontGeometry = useMemo(() => new THREE.ShapeGeometry(innerShieldShape(0.82), 32), [])
  const coreGeometry = useMemo(() => new THREE.ShapeGeometry(innerShieldShape(0.52), 32), [])

  // These geometries are built by hand (outside JSX's declarative <xGeometry/> tags), so unlike
  // primitives they need an explicit dispose on unmount.
  useEffect(() => {
    return () => {
      outerGeometry.dispose()
      frontGeometry.dispose()
      coreGeometry.dispose()
    }
  }, [outerGeometry, frontGeometry, coreGeometry])

  useFrame((state) => {
    if (reduced) return
    const t = state.clock.elapsedTime
    shieldCoreMaterial.emissiveIntensity = 1.0 + Math.sin((t * Math.PI * 2) / CORE_PULSE_PERIOD) * 0.35
  })

  return (
    <group ref={ref} position={[0, 0.02, 0.42]}>
      <mesh geometry={outerGeometry} material={visualMaterials.metal} />
      <mesh geometry={frontGeometry} material={visualMaterials.glass} position={[0, 0, SHIELD_DEPTH / 2 - 0.012]} />
      <mesh geometry={coreGeometry} material={shieldCoreMaterial} position={[0, 0, SHIELD_DEPTH / 2 - 0.05]} />
    </group>
  )
})
