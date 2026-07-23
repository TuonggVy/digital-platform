import { useEffect, useState, type RefObject } from 'react'

export interface ViewportActiveState {
  /** Sticky — true forever once the element has intersected once. Gates the lazy `import()` mount. */
  hasBeenVisible: boolean
  /** Live — true only while the element currently intersects. Gates the Canvas render loop so it
   *  actually stops doing work once the section is scrolled away, not just on first mount. */
  inView: boolean
}

/** Continuous IntersectionObserver (never disconnects itself) so a scene can both lazy-mount once
 *  and pause/resume its render loop every time it scrolls in/out of view. `enabled` should track
 *  whatever breakpoint gate already decides whether the 3D scene applies at all (e.g. tablet+). */
export function useViewportActive(ref: RefObject<HTMLElement | null>, enabled: boolean): ViewportActiveState {
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setHasBeenVisible(true)
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, ref])

  return { hasBeenVisible, inView }
}
