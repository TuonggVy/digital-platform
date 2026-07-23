import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import type * as THREE from 'three'

export interface EntryRevealOptions {
  delay: number
  duration?: number
  startScale?: number
  reduced: boolean
}

/** One node's one-shot pop-in (startScale -> 1), driven by GSAP instead of a hand-rolled
 *  clock.elapsedTime check. Runs once on mount, is skipped (scale snaps to 1) under reduced
 *  motion, and always kills its tween on unmount. */
export function useEntryReveal(ref: RefObject<THREE.Object3D | null>, options: EntryRevealOptions): void {
  const { delay, duration = 0.45, startScale = 0, reduced } = options

  useLayoutEffect(() => {
    const target = ref.current
    if (!target) return

    if (reduced) {
      target.scale.setScalar(1)
      return
    }

    target.scale.setScalar(startScale)
    const tween = gsap.to(target.scale, {
      x: 1,
      y: 1,
      z: 1,
      delay,
      duration,
      ease: 'back.out(1.7)',
    })

    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])
}

export interface SceneEntranceItem {
  ref: RefObject<THREE.Object3D | null>
  delay: number
  startScale?: number
}

/** Builds one real gsap.timeline() sequencing every node's pop-in at its absolute `delay` — the
 *  "nodes scale/fade in, in order, once" entrance for a whole scene. Skips straight to the
 *  settled state under reduced motion. Always torn down on unmount. */
export function useSceneEntranceTimeline(items: SceneEntranceItem[], reduced: boolean, duration = 0.45): void {
  useLayoutEffect(() => {
    if (reduced) {
      items.forEach((item) => item.ref.current?.scale.setScalar(1))
      return
    }

    const timeline = gsap.timeline()
    items.forEach((item) => {
      const target = item.ref.current
      if (!target) return
      const startScale = item.startScale ?? 0
      target.scale.setScalar(startScale)
      timeline.to(
        target.scale,
        { x: 1, y: 1, z: 1, duration, ease: 'back.out(1.7)' },
        item.delay,
      )
    })

    return () => {
      timeline.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])
}
