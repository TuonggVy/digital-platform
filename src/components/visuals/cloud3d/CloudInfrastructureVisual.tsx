import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { CloudProductVisual } from '@/components/visuals/product/CloudProductVisual'
import { useViewportActive } from '@/components/visuals/shared/useViewportActive'
import { usePointerParallax } from '@/components/visuals/shared/usePointerParallax'

// The actual three.js/@react-three/fiber/drei chunk — dynamically imported so none of it
// ships to visitors who never scroll to this section, and none of it ships to mobile at all.
const CloudInfrastructureScene = lazy(() => import('./CloudInfrastructureScene'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

interface CloudSceneErrorBoundaryState {
  hasError: boolean
}

/** If the WebGL scene throws for any reason (driver quirk, context loss), fall back to the
 *  existing 2D illustration rather than showing an error or an empty panel. */
class CloudSceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, CloudSceneErrorBoundaryState> {
  state: CloudSceneErrorBoundaryState = { hasError: false }

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

/** Static ambient backdrop — a glow, the existing Homepage grid texture, and two broad
 *  structural lines echoing Cloud's own rectilinear trace language. No modules, nodes, or
 *  dots: purely low-opacity depth behind the 3D composition, never animated. */
function CloudBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 42%, rgba(0,102,179,0.16), transparent 62%)' }}
      />
      <div className="bg-grid-home-dark absolute inset-0 opacity-25" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 620 380" preserveAspectRatio="none" focusable="false">
        <path d="M40,340 H300 V60" fill="none" stroke="#0066b3" strokeWidth="1" opacity="0.08" />
        <path d="M580,40 H360 V300" fill="none" stroke="#00aeef" strokeWidth="1" opacity="0.07" />
      </svg>
    </div>
  )
}

const ROTATION_Y_RANGE = { full: 20, compact: 10 }
const ROTATION_X_ENTRY = { full: 5, compact: 2.5 }
const ROTATION_X_EXIT = { full: -4, compact: -2 }
const SCALE_ENTRY = { full: 0.97, compact: 0.985 }
const SCALE_EXIT = { full: 1.02, compact: 1.01 }
const SPRING = { stiffness: 90, damping: 22, mass: 0.6 }

interface CloudInfrastructureVisualProps {
  className?: string
}

/** Homepage Cloud section illustration — a real-time 3D infrastructure scene on tablet/desktop
 *  that gently turns with local scroll progress, falling back to the existing 2D
 *  CloudProductVisual on mobile, on WebGL failure, or under prefers-reduced-motion. */
export function CloudInfrastructureVisual({ className }: CloudInfrastructureVisualProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  const isTabletUp = useIsAtLeastWidth(768)
  const isDesktop = useIsAtLeastWidth(1024)
  const compact = isTabletUp && !isDesktop
  const [webglOk] = useState(supportsWebGL)

  const { hasBeenVisible, inView } = useViewportActive(wrapperRef, isTabletUp)

  const size = compact ? 'compact' : 'full'
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start end', 'end start'] })
  const rotYTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [8, 8, 8] : [-ROTATION_Y_RANGE[size], 0, ROTATION_Y_RANGE[size]],
  )
  const rotXTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [2, 2, 2] : [ROTATION_X_ENTRY[size], 0, ROTATION_X_EXIT[size]],
  )
  const scaleTarget = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [SCALE_ENTRY[size], 1, SCALE_EXIT[size]],
  )
  const rotY = useSpring(rotYTarget, SPRING)
  const rotX = useSpring(rotXTarget, SPRING)
  const sceneScale = useSpring(scaleTarget, SPRING)

  const pointer = usePointerParallax(wrapperRef, isDesktop && !reduced)
  const combinedRotY = useTransform([rotY, pointer.offsetY], ([a, b]) => (a as number) + (b as number))
  const combinedRotX = useTransform([rotX, pointer.offsetX], ([a, b]) => (a as number) + (b as number))

  if (!isTabletUp) {
    return <CloudProductVisual variant="full" className={className} />
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)} aria-hidden="true">
      {webglOk && <CloudBackground />}
      {!webglOk ? (
        <CloudProductVisual variant="full" className="h-full w-full" />
      ) : (
        <CloudSceneErrorBoundary fallback={<CloudProductVisual variant="full" className="h-full w-full" />}>
          <Suspense fallback={<div className="h-full w-full" />}>
            {hasBeenVisible && (
              <CloudInfrastructureScene
                rotY={combinedRotY}
                rotX={combinedRotX}
                scale={sceneScale}
                reduced={reduced}
                compact={compact}
                inView={inView}
              />
            )}
          </Suspense>
        </CloudSceneErrorBoundary>
      )}
    </div>
  )
}
