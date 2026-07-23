import { VISUAL_COLOR } from './palette'

export interface SceneLightingProps {
  /** Very small amount of blue-violet in the rim light instead of pure cyan, for depth. Off by
   *  default — set on at most one scene-defining light per visual. */
  violetRim?: boolean
}

/** Shared three-point rig (key / fill / rim) replacing the old flat "ambient + two directional"
 *  setup. Ambient is kept low on purpose so the key/fill/rim actually shape the object instead of
 *  washing it out. */
export function SceneLighting({ violetRim = false }: SceneLightingProps) {
  return (
    <>
      <ambientLight intensity={0.28} />
      {/* Key — soft, chéo trên-trước */}
      <directionalLight position={[3, 4.2, 5]} intensity={1.15} color="#eaf4ff" />
      {/* Fill — yếu hơn, phía đối diện */}
      <directionalLight position={[-3.5, -1.2, 2.4]} intensity={0.32} color="#3fa9dd" />
      {/* Rim — phía sau subject, tách khối khỏi nền tối */}
      <directionalLight
        position={[-1.2, 1.6, -4.4]}
        intensity={0.55}
        color={violetRim ? VISUAL_COLOR.violet : VISUAL_COLOR.active}
      />
    </>
  )
}
