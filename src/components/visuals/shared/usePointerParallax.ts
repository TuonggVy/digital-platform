import { useEffect, type RefObject } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

export interface PointerParallax {
  offsetY: MotionValue<number>
  offsetX: MotionValue<number>
}

const MAX_DEGREES = 1.4
const SPRING = { stiffness: 60, damping: 18, mass: 0.5 }

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Very light pointer-follow parallax (max ~1.4deg), desktop-only. `enabled` should already fold
 *  in "is this a desktop viewport" and "not prefers-reduced-motion" — this hook additionally
 *  requires a fine (mouse-like) pointer so touch devices never attach a listener at all. Offsets
 *  are meant to be summed with the existing scroll-driven rotation via useTransform, not to
 *  replace it. */
export function usePointerParallax(wrapperRef: RefObject<HTMLElement | null>, enabled: boolean): PointerParallax {
  const rawY = useMotionValue(0)
  const rawX = useMotionValue(0)
  const offsetY = useSpring(rawY, SPRING)
  const offsetX = useSpring(rawX, SPRING)

  useEffect(() => {
    const hasFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
    if (!enabled || !hasFinePointer) {
      rawY.set(0)
      rawX.set(0)
      return
    }
    const node = wrapperRef.current
    if (!node) return

    const handleMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1
      rawY.set(clamp(nx, -1, 1) * MAX_DEGREES)
      rawX.set(clamp(-ny, -1, 1) * MAX_DEGREES)
    }
    const handleLeave = () => {
      rawY.set(0)
      rawX.set(0)
    }

    node.addEventListener('pointermove', handleMove)
    node.addEventListener('pointerleave', handleLeave)
    return () => {
      node.removeEventListener('pointermove', handleMove)
      node.removeEventListener('pointerleave', handleLeave)
    }
  }, [enabled, wrapperRef, rawX, rawY])

  return { offsetY, offsetX }
}
