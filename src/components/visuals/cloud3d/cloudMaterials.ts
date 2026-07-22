import * as THREE from 'three'

// Same palette as the rest of the Homepage (--home-beacon / --home-wire / --home-ink-raised /
// --home-graphite-soft) — the 3D scene is not a separate color system, just those tokens in 3D.
export const CLOUD_COLOR = {
  body: '#0a2947',
  edge: '#0066b3',
  active: '#00aeef',
  panel: '#54697d',
} as const

// Created once at module scope so every module/connection shares the same four Material
// instances instead of allocating new ones per mesh.
export const cloudMaterials = {
  body: new THREE.MeshStandardMaterial({ color: CLOUD_COLOR.body, roughness: 0.65, metalness: 0.12 }),
  panel: new THREE.MeshStandardMaterial({ color: CLOUD_COLOR.panel, roughness: 0.75, metalness: 0.05 }),
  edge: new THREE.MeshStandardMaterial({ color: CLOUD_COLOR.edge, roughness: 0.5, metalness: 0.15 }),
  active: new THREE.MeshStandardMaterial({
    color: CLOUD_COLOR.active,
    roughness: 0.3,
    metalness: 0.1,
    emissive: new THREE.Color(CLOUD_COLOR.active),
    emissiveIntensity: 0.6,
  }),
} as const
