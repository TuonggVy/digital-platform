import * as THREE from 'three'
import { VISUAL_COLOR } from './palette'

// Created once at module scope so every scene/mesh shares the same Material instances instead of
// allocating new ones per mesh or per render. Every 3D visual (cloud3d/security3d/esim3d) imports
// from here — a scene may still define one or two extra materials locally for a detail that is
// genuinely specific to it (e.g. eSIM's gold contact lines), but the shared body/glass/panel/edge/
// active set below must not be re-declared per scene.
export const visualMaterials = {
  // Dark metallic frame — used for module/device/phone/chip bodies.
  metal: new THREE.MeshPhysicalMaterial({
    color: VISUAL_COLOR.body,
    roughness: 0.38,
    metalness: 0.65,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
  }),
  // Reserved for the 2-3 surfaces that are genuinely glass in each scene (a core/shield/screen
  // front face) — transmission is comparatively expensive, never apply it broadly.
  glass: new THREE.MeshPhysicalMaterial({
    color: VISUAL_COLOR.body,
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.45,
    thickness: 0.35,
    ior: 1.4,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
  }),
  // Opaque secondary panels/details that are not glass (inset faces, device silhouettes).
  plasticPanel: new THREE.MeshStandardMaterial({
    color: VISUAL_COLOR.panel,
    roughness: 0.78,
    metalness: 0.05,
  }),
  // Blue accent trim — circuit edges, ring bodies, chip substrates.
  edge: new THREE.MeshPhysicalMaterial({
    color: VISUAL_COLOR.edge,
    roughness: 0.42,
    metalness: 0.35,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
  }),
  // Emissive cyan — status lights, data pulses, active details. Tuned so it crosses the Bloom
  // luminance threshold while body/panel/edge stay under it.
  active: new THREE.MeshStandardMaterial({
    color: VISUAL_COLOR.active,
    roughness: 0.3,
    metalness: 0.1,
    emissive: new THREE.Color(VISUAL_COLOR.active),
    emissiveIntensity: 1.1,
  }),
  // Very restrained blue-violet glow — at most one rim highlight or accent detail per scene.
  violetGlow: new THREE.MeshStandardMaterial({
    color: VISUAL_COLOR.violet,
    roughness: 0.35,
    metalness: 0.15,
    emissive: new THREE.Color(VISUAL_COLOR.violet),
    emissiveIntensity: 0.8,
  }),
  // eSIM-only warm metallic contact lines.
  contactGold: new THREE.MeshPhysicalMaterial({
    color: VISUAL_COLOR.contactGold,
    roughness: 0.3,
    metalness: 0.85,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
  }),
} as const

export type VisualMaterialKey = keyof typeof visualMaterials
