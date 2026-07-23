import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { EsimRouteMapVisual } from '@/components/visuals/product/EsimRouteMapVisual'
import { useViewportActive } from '@/components/visuals/shared/useViewportActive'
import { usePointerParallax } from '@/components/visuals/shared/usePointerParallax'

// The actual three.js/@react-three/fiber/drei chunk — dynamically imported so none of it
// ships to visitors who never scroll to this section, and none of it ships to mobile at all.
const EsimConnectionScene = lazy(() => import('./EsimConnectionScene'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

interface EsimSceneErrorBoundaryState {
  hasError: boolean
}

/** If the WebGL scene throws for any reason (driver quirk, context loss), fall back to the
 *  existing 2D illustration rather than showing an error or an empty panel. */
class EsimSceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, EsimSceneErrorBoundaryState> {
  state: EsimSceneErrorBoundaryState = { hasError: false }

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

/** Static ambient backdrop — a vertical oval glow behind the phone, a restrained cyan
 *  concentration near the chip/connection area, and two large faint curved bands not tied to
 *  any origin/destination pair (so it reads as ambient signal, never a route). Never animated. */
function EsimBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 42% 62% at 50% 50%, rgba(0,102,179,0.16), transparent 70%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 30% 30% at 74% 38%, rgba(0,174,239,0.12), transparent 70%)' }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 620 380" preserveAspectRatio="none" focusable="false">
        <path d="M40,340 Q310,240 580,300" fill="none" stroke="#0066b3" strokeWidth="1" opacity="0.07" />
        <path d="M20,120 Q310,20 600,90" fill="none" stroke="#0066b3" strokeWidth="1" opacity="0.06" />
      </svg>
    </div>
  )
}

const ROTATION_Y_RANGE = { full: 12, compact: 6 }
const ROTATION_X_ENTRY = { full: 3, compact: 1.5 }
const ROTATION_X_EXIT = { full: -2, compact: -1 }
const ROTATION_Z_ENTRY = { full: -1, compact: -0.5 }
const ROTATION_Z_EXIT = { full: 1, compact: 0.5 }
const SCALE_ENTRY = { full: 0.98, compact: 0.99 }
const SCALE_EXIT = { full: 1.02, compact: 1.01 }
const SPRING = { stiffness: 90, damping: 22, mass: 0.6 }

interface EsimConnectionVisualProps {
  className?: string
}

/** Homepage eSIM section illustration — a real-time 3D connection journey on tablet/desktop
 *  that gently turns with local scroll progress, falling back to the existing 2D
 *  EsimRouteMapVisual on mobile, on WebGL failure, or under prefers-reduced-motion. */
export function EsimConnectionVisual({ className }: EsimConnectionVisualProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  const isTabletUp = useIsAtLeastWidth(768)
  const isDesktop = useIsAtLeastWidth(1024)
  const compact = isTabletUp && !isDesktop
  const [webglOk] = useState(supportsWebGL)

  const { hasBeenVisible, inView } = useViewportActive(wrapperRef, isTabletUp)
  const pointer = usePointerParallax(wrapperRef, isDesktop && !reduced)

  const size = compact ? 'compact' : 'full'
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start end', 'end start'] })
  const rotYTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [5, 5, 5] : [-ROTATION_Y_RANGE[size], 0, ROTATION_Y_RANGE[size]],
  )
  const rotXTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [1.5, 1.5, 1.5] : [ROTATION_X_ENTRY[size], 0, ROTATION_X_EXIT[size]],
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

  const combinedRotY = useTransform([rotY, pointer.offsetY], ([a, b]) => (a as number) + (b as number))
  const combinedRotX = useTransform([rotX, pointer.offsetX], ([a, b]) => (a as number) + (b as number))

  if (!isTabletUp) {
    return <EsimRouteMapVisual variant="full" className={className} />
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)} aria-hidden="true">
      {webglOk && <EsimBackground />}
      {!webglOk ? (
        <EsimRouteMapVisual variant="full" className="h-full w-full" />
      ) : (
        <EsimSceneErrorBoundary fallback={<EsimRouteMapVisual variant="full" className="h-full w-full" />}>
          <Suspense fallback={<div className="h-full w-full" />}>
            {hasBeenVisible && (
              <EsimConnectionScene
                rotY={combinedRotY}
                rotX={combinedRotX}
                rotZ={rotZ}
                scale={sceneScale}
                reduced={reduced}
                compact={compact}
                inView={inView}
              />
            )}
          </Suspense>
        </EsimSceneErrorBoundary>
      )}
    </div>
  )
}
