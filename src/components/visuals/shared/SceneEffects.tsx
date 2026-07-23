import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export interface SceneEffectsProps {
  /** Disabled on tablet (`compact`) to protect performance — desktop only. */
  enabled: boolean
}

/** Controlled EffectComposer shared by all three scenes. Bloom's luminance threshold is tuned so
 *  only emissive `active`/`violetGlow` materials cross it — metal/glass/panel stay under it and
 *  never bloom. Vignette and Noise are both intentionally subtle. No SSAO/DepthOfField: three
 *  independent Canvases already run concurrently, so we keep post cheap. */
export function SceneEffects({ enabled }: SceneEffectsProps) {
  if (!enabled) return null

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.65}
        luminanceSmoothing={0.25}
        intensity={0.5}
        mipmapBlur
        radius={0.55}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.35} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  )
}
