import * as THREE from 'three'

// Same palette as the rest of the Homepage (--home-beacon / --home-wire / --home-ink-raised /
// --home-graphite-soft). Kept in its own file (not imported from cloud3d) so the Cloud and
// Kaspersky 3D scenes stay fully independent, even though the color values match.
export const SECURITY_COLOR = {
  body: '#0a2947',
  edge: '#0066b3',
  active: '#00aeef',
  panel: '#54697d',
} as const

export const securityMaterials = {
  body: new THREE.MeshStandardMaterial({ color: SECURITY_COLOR.body, roughness: 0.65, metalness: 0.12 }),
  panel: new THREE.MeshStandardMaterial({ color: SECURITY_COLOR.panel, roughness: 0.75, metalness: 0.05 }),
  edge: new THREE.MeshStandardMaterial({ color: SECURITY_COLOR.edge, roughness: 0.5, metalness: 0.15 }),
  active: new THREE.MeshStandardMaterial({
    color: SECURITY_COLOR.active,
    roughness: 0.3,
    metalness: 0.1,
    emissive: new THREE.Color(SECURITY_COLOR.active),
    emissiveIntensity: 0.6,
  }),
} as const
