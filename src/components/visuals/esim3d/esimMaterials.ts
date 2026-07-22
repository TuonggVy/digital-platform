import * as THREE from 'three'

// Same palette as the rest of the Homepage (--home-beacon / --home-wire / --home-ink-raised /
// --home-graphite-soft). Kept in its own file (not imported from cloud3d/security3d) so all
// three 3D features stay fully independent, even though the color values match.
export const ESIM_COLOR = {
  body: '#0a2947',
  edge: '#0066b3',
  active: '#00aeef',
  panel: '#54697d',
} as const

export const esimMaterials = {
  body: new THREE.MeshStandardMaterial({ color: ESIM_COLOR.body, roughness: 0.65, metalness: 0.12 }),
  panel: new THREE.MeshStandardMaterial({ color: ESIM_COLOR.panel, roughness: 0.75, metalness: 0.05 }),
  edge: new THREE.MeshStandardMaterial({ color: ESIM_COLOR.edge, roughness: 0.5, metalness: 0.15 }),
  active: new THREE.MeshStandardMaterial({
    color: ESIM_COLOR.active,
    roughness: 0.3,
    metalness: 0.1,
    emissive: new THREE.Color(ESIM_COLOR.active),
    emissiveIntensity: 0.6,
  }),
} as const
