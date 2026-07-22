import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { SecurityRadarVisual } from '@/components/visuals/product/SecurityRadarVisual'

// The actual three.js/@react-three/fiber/drei chunk — dynamically imported so none of it
// ships to visitors who never scroll to this section, and none of it ships to mobile at all.
const SecurityPerimeterScene = lazy(() => import('./SecurityPerimeterScene'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

interface SecuritySceneErrorBoundaryState {
  hasError: boolean
}

/** If the WebGL scene throws for any reason (driver quirk, context loss), fall back to the
 *  existing 2D illustration rather than showing an error or an empty panel. */
class SecuritySceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  SecuritySceneErrorBoundaryState
> {
  state: SecuritySceneErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function useIsAtLeastWidth(breakpointPx: number): boolean {
  const [isAtLeast, setIsAtLeast] = useState(() => window.innerWidth >= breakpointPx)

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`)
    const onChange = () => setIsAtLeast(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpointPx])

  return isAtLeast
}

/** Static ambient backdrop — a centered glow and two plain, untilted concentric guide rings.
 *  Deliberately symmetrical and flat so it can't read as an orbit or atom model; no dots,
 *  endpoints, or scanning objects, never animated. */
function SecurityBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 48%, rgba(0,102,179,0.17), transparent 60%)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: '1px solid rgba(0,102,179,0.1)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: '1px solid rgba(0,102,179,0.08)' }}
      />
    </div>
  )
}

const ROTATION_Y_RANGE = { full: 16, compact: 8 }
const ROTATION_X_ENTRY = { full: 5, compact: 2.5 }
const ROTATION_X_EXIT = { full: -3, compact: -1.5 }
const ROTATION_Z_ENTRY = { full: -2, compact: -1 }
const ROTATION_Z_EXIT = { full: 2, compact: 1 }
const SCALE_ENTRY = { full: 0.97, compact: 0.985 }
const SCALE_EXIT = { full: 1.02, compact: 1.01 }
const SPRING = { stiffness: 90, damping: 22, mass: 0.6 }

interface SecurityPerimeterVisualProps {
  className?: string
}

/** Homepage Kaspersky section illustration — a real-time 3D security perimeter on
 *  tablet/desktop that gently turns with local scroll progress, falling back to the existing
 *  2D SecurityRadarVisual on mobile, on WebGL failure, or under prefers-reduced-motion. */
export function SecurityPerimeterVisual({ className }: SecurityPerimeterVisualProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  const isTabletUp = useIsAtLeastWidth(768)
  const isDesktop = useIsAtLeastWidth(1024)
  const compact = isTabletUp && !isDesktop
  const [webglOk] = useState(supportsWebGL)

  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  useEffect(() => {
    if (!isTabletUp || hasBeenVisible) return
    const node = wrapperRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [isTabletUp, hasBeenVisible])

  const size = compact ? 'compact' : 'full'
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start end', 'end start'] })
  const rotYTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [6, 6, 6] : [-ROTATION_Y_RANGE[size], 0, ROTATION_Y_RANGE[size]],
  )
  const rotXTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [2, 2, 2] : [ROTATION_X_ENTRY[size], 0, ROTATION_X_EXIT[size]],
  )
  const rotZTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [0, 0, 0] : [ROTATION_Z_ENTRY[size], 0, ROTATION_Z_EXIT[size]],
  )
  const scaleTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [SCALE_ENTRY[size], 1, SCALE_EXIT[size]],
  )
  const rotY = useSpring(rotYTarget, SPRING)
  const rotX = useSpring(rotXTarget, SPRING)
  const rotZ = useSpring(rotZTarget, SPRING)
  const sceneScale = useSpring(scaleTarget, SPRING)

  if (!isTabletUp) {
    return <SecurityRadarVisual variant="full" className={className} />
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)} aria-hidden="true">
      {webglOk && <SecurityBackground />}
      {!webglOk ? (
        <SecurityRadarVisual variant="full" className="h-full w-full" />
      ) : (
        <SecuritySceneErrorBoundary fallback={<SecurityRadarVisual variant="full" className="h-full w-full" />}>
          <Suspense fallback={<div className="h-full w-full" />}>
            {hasBeenVisible && (
              <SecurityPerimeterScene
                rotY={rotY}
                rotX={rotX}
                rotZ={rotZ}
                scale={sceneScale}
                reduced={reduced}
                compact={compact}
              />
            )}
          </Suspense>
        </SecuritySceneErrorBoundary>
      )}
    </div>
  )
}
