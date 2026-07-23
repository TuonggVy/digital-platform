import { Environment, Lightformer } from '@react-three/drei'

/** Procedural reflection environment — two soft rectangular Lightformers, no HDRI file. Baked
 *  once (drei's default `frames={1}`) so it costs a single small render, not a per-frame cost.
 *  Gives metal/glass materials a believable reflection instead of looking matte/flat. */
export function SceneEnvironment() {
  return (
    <Environment resolution={16} background={false}>
      <Lightformer form="rect" intensity={1.4} color="#8fd6ff" position={[2.5, 3, 2]} scale={[3, 2, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#5b5fd1" position={[-3, -1.5, -2]} scale={[2.5, 1.5, 1]} />
    </Environment>
  )
}
