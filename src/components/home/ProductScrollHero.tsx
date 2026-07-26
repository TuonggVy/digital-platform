import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type AnimationPlaybackControls,
  type MotionStyle,
  type MotionValue,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'

const HERO_IMAGE = '/images/hero/cloud-hero.webp'

/** A pure visual showcase, not a commerce listing — no `href`/`tagline` (there is no Link, no
 *  description). `label` is the small eyebrow above the name; `badge` is the short descriptor
 *  pill below it. See `ShowcaseCaption`. */
interface ShowcaseProduct {
  id: string
  name: string
  image: string
  label: string
  badge: string
}

const PRODUCTS: Record<'cloud' | 'kaspersky' | 'esim', ShowcaseProduct> = {
  cloud: {
    id: 'cloud',
    name: 'Cloud Server',
    image: '/images/hero/cloud-card.webp',
    label: 'VTC TELECOM',
    badge: 'HẠ TẦNG ĐÁM MÂY',
  },
  kaspersky: {
    id: 'kaspersky',
    name: 'Kaspersky Security',
    image: '/images/hero/kaspersky-card.webp',
    label: 'VTC TELECOM',
    badge: 'BẢO MẬT THIẾT BỊ',
  },
  esim: {
    id: 'esim',
    name: 'eSIM Data',
    image: '/images/hero/esim-card.webp',
    label: 'VTC TELECOM',
    badge: 'KẾT NỐI TOÀN CẦU',
  },
}

/** All in `visualProgress` space: 0 = Product Lineup's top just touching the bottom of the
 *  viewport, 1 = Product Lineup's top at the viewport top. No spring is layered on top of it
 *  anywhere in this file (see `HeroProductsExperience` doc comment for why) — every reveal here
 *  reads the same master value the shared image's geometry does, and lands at exactly 0/1 in the
 *  same frame a controlled transition does. */
const TIMELINE = {
  heroCopy: [0, 0.22],
  productHeading: [0.06, 0.34],
  kasperskyOpacity: [0.1, 0.46],
  kasperskyTransform: [0.1, 0.54],
  esimOpacity: [0.14, 0.5],
  esimTransform: [0.14, 0.58],
} satisfies Record<string, number[]>

/** Duration/easing for the one controlled animation in this file: the guaranteed hand-off scroll
 *  from a resting Hero to a resting Product Lineup (and back). `[0.16, 1, 0.3, 1]` was too
 *  front-loaded — ~10% of the duration already covered ~50% of the distance, reading as a big
 *  jump followed by a long, mostly-static tail. This curve has real motion from frame one, no
 *  flat start and no long tail: still moving noticeably in the first ~10%, still easing (not
 *  frozen) in the last ~10%. */
const AUTO_SCROLL_DURATION = 0.68
const AUTO_SCROLL_EASE = [0.22, 0.61, 0.36, 1] as const
/** How far (in px, real document-layout distance) actual scroll position may be from a resting
 *  point and still count as "starting a gesture there". Generous on purpose: a trackpad's first
 *  wheel tick can arrive after the browser has already let a few (sometimes 10-20) px of native
 *  scroll through, and that must still count as "at Hero" / "at Product Lineup" — a tight
 *  tolerance would silently miss the very first gesture and fall back to slow native scroll. */
const HERO_CAPTURE_ZONE_PX = 96
const PRODUCTS_CAPTURE_ZONE_PX = 48
/** Forward/reverse capture also requires `visualProgress` to still be near the boundary's own end
 *  — position alone isn't enough once a real scroll has carried the page deep into the transition. */
const FORWARD_CAPTURE_MAX_PROGRESS = 0.12
const REVERSE_CAPTURE_MIN_PROGRESS = 0.88
/** Fixed, non-renewable window right after `animatePageScrollTo` lands (~2 frames at 60Hz): just
 *  long enough to swallow the SAME gesture's trailing momentum so it doesn't carry straight into
 *  Trusted By. Never extended — a genuinely new gesture arriving after this is handled immediately. */
const POST_LANDING_BLOCK_MS = 32
/** Not a visible crossfade: the ENTIRE real Cloud card (`targetCardOpacity`, applied to the whole
 *  `CloudShowcaseCard` figure — background, gradient, shadow, caption, image, all of it) is always
 *  prepared to full opacity UNDERNEATH the still-opaque shared image (forward), or the shared image
 *  is brought back on top of the still-opaque real card (reverse) — the other layer is only
 *  switched away once it's no longer needed. Two overlapping layers at fractional alpha would
 *  otherwise briefly dim/soften the frame via alpha compositing, which reads as a flicker even when
 *  their rects match exactly. `linear`, since this fade is never meant to be seen — an easing curve
 *  has no visible effect to shape here, only extra complexity. Runs only once geometry is already
 *  sitting exactly on `targetRect` (forward: right after the scroll animation completes; reverse:
 *  right before it starts), so both layers are pixel-identical (same file/crop/radius/rect/caption)
 *  for its whole duration. */
const HANDOFF_DURATION = 0.08
const HANDOFF_EASE = 'linear' as const

const SIDE_SHOWCASE_CLASS = 'h-[clamp(19rem,42svh,27rem)]'
const CLOUD_SHOWCASE_CLASS = 'h-[clamp(23rem,50svh,32rem)]'
const MOBILE_SHOWCASE_CLASS = 'h-[clamp(21rem,62svh,30rem)]'

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

interface VisualRect {
  top: number
  left: number
  width: number
  height: number
}

function rectsEqual(a: VisualRect | null, b: VisualRect) {
  return !!a && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
}

function useIsDesktop(breakpointPx = 1024) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= breakpointPx,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`)
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpointPx])

  return isDesktop
}

export function ProductScrollHero() {
  const prefersReducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()
  const useScrollJack = isDesktop && !prefersReducedMotion

  return useScrollJack ? <HeroProductsExperience /> : <SimplifiedHero />
}

/** Desktop experience: Hero and Product Lineup are two real, independent sibling `<section>`s in
 *  normal document flow. Hero is `sticky top-0`; Product Lineup is a normal block that slides up
 *  over it as the user scrolls.
 *
 *  A real shared-element transition: one continuous image morphs from Hero's real, measured box
 *  (`sourceRect`) to the Cloud card's real, measured image-slot rect (`targetRect`). It is
 *  rendered through `createPortal(..., document.body)` as `position: fixed` — NOT a plain fixed
 *  sibling inside this tree. The reason: `PageTransition` (which every route's content renders
 *  inside, via `PublicLayout`) wraps `<Outlet />` in a `motion.div` that keeps an active
 *  `transform: translateY(...)` whenever `prefers-reduced-motion` is off — per the CSS spec, an
 *  ancestor with `transform` becomes the containing block for `position: fixed` descendants, so a
 *  plain fixed sibling here would size/position itself relative to that (scrollable, non-fixed)
 *  wrapper instead of the true viewport, and would scroll away with the page instead of staying
 *  pinned during the transition. Portaling to `document.body` sidesteps that ancestor entirely.
 *
 *  Every motion value in this file — the shared image's geometry/opacity AND every reveal (hero
 *  copy, heading, side cards, Cloud body) — reads the SAME single master value, `visualProgress`
 *  (a plain `useMotionValue`), never `scrollYProgress` directly. No spring anywhere.
 *
 *  `scrollYProgress` itself comes from `useScroll({ target: productSectionRef, offset: ['start
 *  end', 'start start'] })` — real scroll position between "Product Lineup's top touches the
 *  viewport bottom" (0) and "Product Lineup's top reaches the viewport top" (1). This is
 *  deliberately NOT `target: experienceRef` with `['start start', 'end end']`: Product Lineup's
 *  real height can be taller than one viewport (it has `min-h-[100svh]`, not a fixed height), and
 *  anchoring to the whole experience wrapper would push progress 1 out to whenever Product
 *  Lineup's *bottom* clears the viewport — by which point the Cloud card slot has long since
 *  arrived, so the shared image's hand-off timing (tied to progress) would no longer line up with
 *  reality. But `scrollYProgress` only updates on a browser scroll event, one async hop behind
 *  whatever moved `window.scrollY` — during a controlled transition that hop is exactly what
 *  produced a "stuck, then jump" look. So a plain effect mirrors `scrollYProgress` into
 *  `visualProgress` ONLY while nothing else is driving it (native scrolling); the moment
 *  `animatePageScrollTo` is running, it writes `visualProgress` directly, in the very same
 *  `onUpdate` tick it also calls `window.scrollTo` — visuals and actual scroll position derive
 *  from the identical `timeProgress` number every frame, with no event round-trip between them.
 *
 *  A native, unassisted scroll can still be very light (a few px) or a fast fling. To guarantee a
 *  light or heavy wheel/key both still drive progress all the way to 1 (or back to 0), a capture
 *  exists near — not only exactly at — Hero or Product Lineup's resting position: a generous
 *  `HERO_CAPTURE_ZONE_PX`/`PRODUCTS_CAPTURE_ZONE_PX` window around each (position, via a
 *  transform-proof layout offset, not `getBoundingClientRect()` — see the effect body for why),
 *  combined with a `visualProgress` threshold near the corresponding end, so a gesture that has
 *  already let a few px of native scroll through still gets captured. It actively animates
 *  `visualProgress` and real `window.scrollY` together to the other resting point via
 *  `animatePageScrollTo`, forcing `scroll-behavior` to `auto` for the duration (see the effect
 *  body) so `html { scroll-behavior: smooth }` in `src/index.css` can't add a second, competing
 *  easing on top of it, and gets out of the way entirely once it lands — nothing is held or
 *  delayed afterward beyond a fixed, non-renewable `POST_LANDING_BLOCK_MS` window that
 *  only absorbs the SAME gesture's trailing momentum. */
function HeroProductsExperience() {
  const experienceRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLElement>(null)
  const productSectionRef = useRef<HTMLElement>(null)
  const heroVisualRef = useRef<HTMLDivElement>(null)
  const cloudTargetSlotRef = useRef<HTMLElement>(null)

  const [sourceRect, setSourceRect] = useState<VisualRect | null>(null)
  const [targetRect, setTargetRect] = useState<VisualRect | null>(null)

  // `scrollYProgress` is real, native-scroll-derived progress — but it only updates after a
  // browser scroll event fires, which lags one update-cycle behind whatever moved `window.scrollY`.
  // `visualProgress` is the actual single source every visual below reads: native scroll writes
  // into it (effect below) when nothing else is driving it, and `animatePageScrollTo` writes into
  // it directly, in the same animation frame it also calls `window.scrollTo`, so visuals never
  // wait on a scroll event to catch up with a controlled transition.
  const { scrollYProgress } = useScroll({
    target: productSectionRef,
    offset: ['start end', 'start start'],
  })
  const visualProgress = useMotionValue(scrollYProgress.get())
  // 1 once the shared (portaled) image has handed off to the real Cloud card image, 0 while the
  // shared image is still the one the user should be looking at. Written directly by
  // `animatePageScrollTo`'s forward/reverse hand-off animations, never by scroll progress —
  // geometry (below) has already fully landed on `targetRect` by the time this ever moves.
  const handoffProgress = useMotionValue(scrollYProgress.get() >= 0.999 ? 1 : 0)
  // Purely an asset-readiness flag: 0 until `sourceRect`/`targetRect` are measured AND
  // `HERO_IMAGE` has decoded (effect below), 1 once the shared portal image has something correct
  // to paint. This does NOT decide which layer is visible — see `sharedActive` for that — because
  // route navigation makes those two questions genuinely different: on a fresh mount (e.g.
  // navigating back to Home), assets can become ready well before `PageTransition`'s entrance
  // animation finishes, and if readiness alone controlled visibility, the portal (which ignores
  // that transform, being fixed to `document.body`) would take over from Hero's own in-flow image
  // mid-transition, causing a visible jump between the two coordinate spaces.
  const sharedAssetReady = useMotionValue(0)
  // 0: Hero's own in-flow `<img>` is the visible layer (always true right after a route mount,
  // for the entire `PageTransition` entrance, and at rest at Hero). 1: the shared portal image is
  // active. The ONLY two places this is ever set to 1 are immediately before a forward transition
  // starts and immediately before a reverse transition starts (both while the portal is sitting
  // at the exact same rect/crop as whichever in-flow image it's taking over from) — never by
  // mount, asset readiness, measurement, or any effect that isn't a user-initiated gesture.
  const sharedActive = useMotionValue(0)
  // 1 while the shared (portaled) image is the layer the user is meant to see, 0 once the real
  // Cloud card image has fully taken over. Toggled only once the OTHER layer is already at the
  // opacity being switched to — since both layers are pixel-identical (same file/crop/radius/rect)
  // at that instant, the switch itself is invisible, unlike a complementary alpha crossfade.
  const sharedLayerVisible = useMotionValue(1)

  const scrollAnimationRef = useRef<AnimationPlaybackControls | null>(null)
  const handoffAnimationRef = useRef<AnimationPlaybackControls | null>(null)
  const activationRafRef = useRef<number | null>(null)
  const isAutoScrollingRef = useRef(false)
  const blockWheelUntilRef = useRef(0)
  const previousScrollBehaviorRef = useRef('')
  const sourceRectRef = useRef<VisualRect | null>(null)
  const targetRectRef = useRef<VisualRect | null>(null)
  const measureRectsRef = useRef<(() => { source: VisualRect; target: VisualRect } | null) | null>(null)

  useEffect(() => {
    return scrollYProgress.on('change', (progress) => {
      if (!isAutoScrollingRef.current) {
        visualProgress.set(progress)
      }
    })
  }, [scrollYProgress, visualProgress])

  useLayoutEffect(() => {
    const heroVisual = heroVisualRef.current
    const productSection = productSectionRef.current
    const targetSlot = cloudTargetSlotRef.current
    if (!heroVisual || !productSection || !targetSlot) return

    // Returns the freshly-measured rects (not just committed to state/refs) so a caller that needs
    // geometry to be correct RIGHT NOW — e.g. right before starting a forward transition — doesn't
    // have to wait for a React re-render to pick it up (see `sourceRectRef`/`targetRectRef` below,
    // read directly by the geometry transforms instead of the `sourceRect`/`targetRect` state).
    function measureRects(): { source: VisualRect; target: VisualRect } | null {
      if (!heroVisual || !productSection || !targetSlot) return null
      // Never commit new geometry mid-transition — a font/layout shift here would move the
      // shared image's start/end points while it's actively animating between them.
      if (isAutoScrollingRef.current) return null
      const heroRect = heroVisual.getBoundingClientRect()
      const productRect = productSection.getBoundingClientRect()
      const slotRect = targetSlot.getBoundingClientRect()

      // A transient 0×0 read (layout not settled yet, fonts/images still loading) would
      // otherwise poison the shared image to a collapsed box — skip it, retry on the next tick.
      if (heroRect.width <= 0 || heroRect.height <= 0 || slotRect.width <= 0 || slotRect.height <= 0) {
        return null
      }

      const nextSource: VisualRect = {
        top: heroRect.top,
        left: heroRect.left,
        width: heroRect.width,
        height: heroRect.height,
      }
      const nextTarget: VisualRect = {
        // The slot's viewport position once Product Lineup's own top reaches 0 — invariant to
        // scroll, since it's an offset local to Product Lineup's own box.
        top: slotRect.top - productRect.top,
        left: slotRect.left,
        width: slotRect.width,
        height: slotRect.height,
      }

      sourceRectRef.current = nextSource
      targetRectRef.current = nextTarget

      // Only commit — and only re-render — when something has actually changed. Never re-measure
      // on a scroll frame; only layout changes (mount, fonts, resize) trigger this at all.
      setSourceRect((prev) => (rectsEqual(prev, nextSource) ? prev : nextSource))
      setTargetRect((prev) => (rectsEqual(prev, nextTarget) ? prev : nextTarget))

      return { source: nextSource, target: nextTarget }
    }

    measureRectsRef.current = measureRects

    measureRects()
    const raf1 = requestAnimationFrame(() => {
      measureRects()
      requestAnimationFrame(measureRects)
    })
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(measureRects)
    }
    window.addEventListener('resize', measureRects)

    const observer = new ResizeObserver(() => requestAnimationFrame(measureRects))
    observer.observe(heroVisual)
    observer.observe(productSection)
    observer.observe(targetSlot)

    return () => {
      cancelAnimationFrame(raf1)
      window.removeEventListener('resize', measureRects)
      observer.disconnect()
    }
  }, [])

  // Marks the shared image's ASSET as ready only once both rects are measured AND the image file
  // itself has decoded. This is readiness only, never visibility — it must NOT flip which layer
  // is on screen (that's `sharedActive`, set only by a user gesture in `animatePageScrollTo`).
  // Mixing the two was the actual cause of the route-entry jitter: readiness naturally completes
  // very early after a fresh mount (often before `PageTransition`'s entrance animation finishes),
  // so if it also switched the portal on, the portal — fixed to `document.body`, unaffected by
  // `PageTransition`'s transform — would take over from Hero's still-animating in-flow image,
  // jumping between the two coordinate spaces mid-transition.
  useEffect(() => {
    if (!sourceRect || !targetRect) {
      sharedAssetReady.set(0)
      return
    }

    let cancelled = false
    const image = new Image()
    image.src = HERO_IMAGE

    function markReady() {
      if (cancelled) return
      requestAnimationFrame(() => {
        if (cancelled) return
        sharedAssetReady.set(1)
      })
    }

    if (image.complete) {
      image.decode?.().then(markReady).catch(markReady)
    } else {
      image.onload = markReady
      image.onerror = markReady
    }

    return () => {
      cancelled = true
    }
  }, [sourceRect, targetRect, sharedAssetReady])

  useEffect(() => {
    // NOT `window.scrollY + element.getBoundingClientRect().top`: this whole tree renders inside
    // `PageTransition`'s `motion.div`, which keeps an active CSS `transform` on every route. A
    // `transform` shifts an element's painted position without moving it in layout, and
    // `getBoundingClientRect()` reports the painted (visual) position — so that formula was
    // reading a boundary offset by however far the page-transition transform had shifted things,
    // which could easily be more than a few px, silently failing the tolerance check below and
    // making the very first wheel tick fall through to native scroll instead of being captured.
    // `offsetTop`/`offsetParent` are pure layout properties, unaffected by `transform` on any
    // ancestor, so walking that chain gives the real, transform-proof document top.
    function getLayoutDocumentTop(element: HTMLElement) {
      let top = 0
      let current: HTMLElement | null = element
      while (current) {
        top += current.offsetTop
        current = current.offsetParent as HTMLElement | null
      }
      return top
    }

    function getScrollBoundaries() {
      const experience = experienceRef.current
      const productSection = productSectionRef.current
      if (!experience || !productSection) return null
      return {
        heroY: getLayoutDocumentTop(experience),
        productsY: getLayoutDocumentTop(productSection),
      }
    }

    function forceInstantScrollBehavior() {
      const root = document.documentElement
      previousScrollBehaviorRef.current = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
    }

    function restoreScrollBehavior() {
      document.documentElement.style.scrollBehavior = previousScrollBehaviorRef.current
    }

    // Drives ONE master value (`timeProgress`, 0→1 over wall-clock time) and derives both the
    // visual progress and the actual scroll position from it in the same `onUpdate` tick — so
    // `visualProgress.set(...)` and `window.scrollTo(...)` land in the same animation frame.
    // Never animate `window.scrollY` directly and read visuals back off a scroll event: that
    // route goes animate → scrollTo → browser scroll event → useScroll → transforms, which is a
    // full extra async hop and is exactly what produced the "stuck, then jump" motion.
    //
    // The shared/target image hand-off (`handoffProgress`, `sharedLayerVisible`) is sequenced
    // around this, not mixed into it: geometry and the real Cloud card position both only
    // coincide at progress 1, so the hand-off must happen entirely while the page is at rest at
    // that exact point — forward, that means AFTER this scroll animation lands; reverse, that
    // means BEFORE it starts (so bringing the shared image back on top happens while it and the
    // real card image still occupy the exact same rect, and only then does the shared image start
    // expanding back out toward Hero).
    function runScrollAnimation(targetY: number, targetProgress: 0 | 1) {
      const startY = window.scrollY
      const rawStartProgress = visualProgress.get()
      // A few px of native scroll can slip through before capture fires — clamp the animation's
      // own start so it always covers the full, correct distance and still lands exactly at 0/1,
      // instead of starting from wherever native scroll happened to leave `visualProgress`.
      const startProgress =
        targetProgress === 1 ? Math.min(rawStartProgress, 0.12) : Math.max(rawStartProgress, 0.88)

      scrollAnimationRef.current?.stop()

      scrollAnimationRef.current = animate(0, 1, {
        duration: AUTO_SCROLL_DURATION,
        ease: AUTO_SCROLL_EASE,
        onUpdate: (timeProgress) => {
          visualProgress.set(lerp(startProgress, targetProgress, timeProgress))
          window.scrollTo(0, lerp(startY, targetY, timeProgress))
        },
        onComplete: () => {
          visualProgress.set(targetProgress)
          window.scrollTo({ top: targetY, behavior: 'auto' })

          if (targetProgress === 0) {
            // Reverse: the pre-scroll hand-off (below) already brought the shared image back on
            // top before this ran, so landing at Hero is the last step of the gesture. Shared and
            // Hero source now coincide exactly at `sourceRect` — hand back to Hero's own in-flow
            // image so no portal layer is left active for the next route navigation.
            sharedActive.set(0)
            finishGesture()
            return
          }

          // Forward: geometry has just landed exactly on `targetRect` — only now is it safe to
          // prepare the real card image underneath the still-fully-opaque shared image.
          handoffAnimationRef.current?.stop()
          handoffAnimationRef.current = animate(handoffProgress, 1, {
            duration: HANDOFF_DURATION,
            ease: HANDOFF_EASE,
            onComplete: () => {
              handoffProgress.set(1)
              // The real card image is now fully opaque underneath — dropping the shared layer
              // here is invisible, since both are pixel-identical (same file/crop/radius/rect).
              sharedLayerVisible.set(0)
              finishGesture()
            },
          })
        },
      })
    }

    function finishGesture() {
      restoreScrollBehavior()
      isAutoScrollingRef.current = false
      blockWheelUntilRef.current = performance.now() + POST_LANDING_BLOCK_MS

      // Geometry measurement was skipped for the whole transition (see `measureRects`) — catch
      // up now that the shared image is at rest, not mid-flight.
      requestAnimationFrame(() => {
        measureRectsRef.current?.()
      })
    }

    function animatePageScrollTo(targetY: number, targetProgress: 0 | 1) {
      if (isAutoScrollingRef.current) return

      if (targetProgress === 1) {
        if (sharedAssetReady.get() < 0.999) {
          // Shared image's asset hasn't finished measuring/decoding yet. This only matters in the
          // instant right after mount; nudge a remeasure and let the very next gesture (which, by
          // then, is effectively immediate) pick the transition up instead.
          measureRectsRef.current?.()
          return
        }

        // By the time a user gesture reaches here, `PageTransition` has almost certainly finished
        // (an initial route entrance is a one-off ~0.25s animation, not something still running
        // by the time someone scrolls). Re-measure fresh right now anyway, synchronously, so the
        // portal activates at the CURRENT true Hero rect rather than whatever was last committed
        // to React state — `measureRects` writes `sourceRectRef`/`targetRectRef` synchronously,
        // and the geometry transforms below read those refs first, so this takes effect
        // immediately without waiting on a re-render.
        const freshRects = measureRectsRef.current?.()
        if (!freshRects) return
      }

      isAutoScrollingRef.current = true
      scrollAnimationRef.current?.stop()
      handoffAnimationRef.current?.stop()
      if (activationRafRef.current !== null) {
        cancelAnimationFrame(activationRafRef.current)
        activationRafRef.current = null
      }
      forceInstantScrollBehavior()

      if (targetProgress === 1) {
        handoffProgress.set(0)
        sharedLayerVisible.set(1)
        // The portal now sits exactly on the just-remeasured `sourceRect`, pixel-identical to
        // Hero's own image (same file, same default crop) — activating it here is invisible.
        sharedActive.set(1)

        // Two animation frames before the geometry morph itself starts moving: frame 1 is where
        // Hero's own image turns off and the portal turns on (both showing the same pixels at the
        // same rect); frame 2 gives the browser a chance to actually composite/rasterize that
        // portal layer. Only on the frame after that does `runScrollAnimation` start shrinking it
        // — without this gap, the very first frame of the morph can double as the portal's first
        // paint, which reads as a small stutter.
        activationRafRef.current = requestAnimationFrame(() => {
          activationRafRef.current = requestAnimationFrame(() => {
            activationRafRef.current = null
            runScrollAnimation(targetY, targetProgress)
          })
        })
        return
      }

      // Reverse: bring the shared image back on top FIRST, while it and the real card image still
      // occupy the exact same rect (same file/crop/radius) — invisible, since both layers are
      // pixel-identical at that instant — then fade the real card image out underneath it, and
      // only once that's done does the shared image start expanding back out toward Hero.
      sharedActive.set(1)
      sharedLayerVisible.set(1)
      handoffAnimationRef.current = animate(handoffProgress, 0, {
        duration: HANDOFF_DURATION,
        ease: HANDOFF_EASE,
        onComplete: () => {
          handoffProgress.set(0)
          runScrollAnimation(targetY, targetProgress)
        },
      })
    }

    function handleWheel(event: WheelEvent) {
      if (isAutoScrollingRef.current) {
        // Don't let native scroll fight the animate() call mid-flight.
        event.preventDefault()
        return
      }

      if (performance.now() < blockWheelUntilRef.current) {
        event.preventDefault()
        return
      }

      const boundaries = getScrollBoundaries()
      if (!boundaries) return

      const currentY = window.scrollY
      const progress = visualProgress.get()

      const isNearHero =
        currentY >= boundaries.heroY - HERO_CAPTURE_ZONE_PX &&
        currentY <= boundaries.heroY + HERO_CAPTURE_ZONE_PX
      const isNearProducts =
        currentY >= boundaries.productsY - PRODUCTS_CAPTURE_ZONE_PX &&
        currentY <= boundaries.productsY + PRODUCTS_CAPTURE_ZONE_PX

      // Deliberately no deltaY magnitude check — a barely-there trackpad tick (deltaY ~0.5) must
      // capture just as reliably as a hard fling. Position (capture zone) + progress together are
      // what decide "is this the start of a Hero→Products gesture", not how strongly it scrolled.
      if (event.deltaY > 0 && isNearHero && progress < FORWARD_CAPTURE_MAX_PROGRESS) {
        event.preventDefault()
        animatePageScrollTo(boundaries.productsY, 1)
        return
      }

      if (event.deltaY < 0 && isNearProducts && progress > REVERSE_CAPTURE_MIN_PROGRESS) {
        event.preventDefault()
        animatePageScrollTo(boundaries.heroY, 0)
      }

      // Everywhere else, native scroll handles it.
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (target?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return
      }

      const isDownKey = event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' '
      const isUpKey = event.key === 'ArrowUp' || event.key === 'PageUp'
      if (!isDownKey && !isUpKey) return

      if (isAutoScrollingRef.current) {
        event.preventDefault()
        return
      }

      const boundaries = getScrollBoundaries()
      if (!boundaries) return

      const currentY = window.scrollY
      const progress = visualProgress.get()

      const isNearHero =
        currentY >= boundaries.heroY - HERO_CAPTURE_ZONE_PX &&
        currentY <= boundaries.heroY + HERO_CAPTURE_ZONE_PX
      const isNearProducts =
        currentY >= boundaries.productsY - PRODUCTS_CAPTURE_ZONE_PX &&
        currentY <= boundaries.productsY + PRODUCTS_CAPTURE_ZONE_PX

      if (isDownKey && isNearHero && progress < FORWARD_CAPTURE_MAX_PROGRESS) {
        event.preventDefault()
        animatePageScrollTo(boundaries.productsY, 1)
        return
      }

      if (isUpKey && isNearProducts && progress > REVERSE_CAPTURE_MIN_PROGRESS) {
        event.preventDefault()
        animatePageScrollTo(boundaries.heroY, 0)
      }
    }

    // Capture phase: this handler must see the wheel event, and call `preventDefault()`, before
    // any bubble-phase listener (native scroll, a third-party smooth-scroll polyfill, etc.) can
    // act on it — otherwise a light first tick can start native scrolling before capture runs.
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      window.removeEventListener('keydown', handleKeyDown)
      scrollAnimationRef.current?.stop()
      handoffAnimationRef.current?.stop()
      if (activationRafRef.current !== null) {
        cancelAnimationFrame(activationRafRef.current)
        activationRafRef.current = null
      }
      restoreScrollBehavior()
      isAutoScrollingRef.current = false
      blockWheelUntilRef.current = 0
      sharedAssetReady.set(0)
      sharedActive.set(0)
      sharedLayerVisible.set(1)
      handoffProgress.set(0)
    }
  }, [visualProgress, handoffProgress, sharedAssetReady, sharedActive, sharedLayerVisible])

  // Shared image geometry runs on `visualProgress` all the way to 1 — it does NOT dock early.
  // `targetRect` is measured as the Cloud card slot's position once Product Lineup's own top
  // reaches the viewport top (see `measureRects` above: `slotRect.top - productRect.top`, an
  // offset local to Product Lineup's own box) — i.e. it's only valid at `visualProgress === 1`.
  // An earlier attempt clamped geometry to "docked" at progress 0.84 so it could crossfade before
  // the scroll finished; but Product Lineup itself doesn't reach that position until progress 1,
  // so the shared image sat still while the real card kept sliding up underneath it — the two
  // rects never matched, and the crossfade at 0.84 read as a visible "pop" into the wrong spot.
  // Geometry and the real card's position now both complete at exactly the same progress (1), so
  // by construction they coincide — the hand-off (`handoffProgress`/`sharedLayerVisible` below)
  // only ever runs once that's true, not on a fixed progress window.
  //
  // Reads `sourceRectRef`/`targetRectRef` first, falling back to the `sourceRect`/`targetRect`
  // state only if a ref hasn't been populated yet (i.e. before the very first measurement ever
  // commits). `animatePageScrollTo` calls `measureRects()` synchronously — writing the refs
  // immediately — right before activating the portal, specifically so this geometry reflects that
  // fresh measurement on the very next frame instead of waiting for the state update it also
  // triggers to flow through a React re-render.
  const sharedTop = useTransform(visualProgress, (progress) => {
    const source = sourceRectRef.current ?? sourceRect
    const target = targetRectRef.current ?? targetRect
    return source && target ? lerp(source.top, target.top, progress) : 0
  })
  const sharedLeft = useTransform(visualProgress, (progress) => {
    const source = sourceRectRef.current ?? sourceRect
    const target = targetRectRef.current ?? targetRect
    return source && target ? lerp(source.left, target.left, progress) : 0
  })
  const sharedWidth = useTransform(visualProgress, (progress) => {
    const source = sourceRectRef.current ?? sourceRect
    const target = targetRectRef.current ?? targetRect
    return source && target ? lerp(source.width, target.width, progress) : 0
  })
  const sharedHeight = useTransform(visualProgress, (progress) => {
    const source = sourceRectRef.current ?? sourceRect
    const target = targetRectRef.current ?? targetRect
    return source && target ? lerp(source.height, target.height, progress) : 0
  })
  // The Cloud card is now a full-image showcase, rounded on all four corners (not just the top
  // two the old image-slot-above-a-white-body layout needed). Both keyframes spell out all four
  // corners (not a bare '0px'): Framer Motion's string interpolation only tweens smoothly when
  // both ends have the same number of numeric tokens — a mismatched count snaps instantly at the
  // very start of the range instead of morphing, verified directly against framer-motion's `mix()`.
  const sharedRadius = useTransform(visualProgress, [0, 1], ['0px 0px 0px 0px', '28px 28px 28px 28px'])
  // Keeps the cloud + server subject visible as the frame crops from a wide hero into a tall card;
  // reaches the exact same crop the real card image uses ('72% 52%', see `CloudShowcaseCard`) by
  // progress 1, so nothing shifts crop mid-crossfade.
  const sharedObjectPosition = useTransform(visualProgress, [0, 0.5, 1], ['50% 50%', '60% 50%', '72% 52%'])
  // Two gradients, not one: Hero's own gradient (dark, full-bleed) fades OUT early, and the Cloud
  // showcase's own gradient + vignette (lighter, bottom-anchored — see `CloudShowcaseCard`) fades
  // IN before progress 1. Without the second one, the shared image would hand off to the real card
  // with a visibly different overlay right at the swap (the hand-off is a hard on/off switch, not
  // a crossfade — see `HANDOFF_DURATION`'s doc comment — so any mismatch pops instead of blending).
  const sharedHeroGradientOpacity = useTransform(visualProgress, [0.03, 0.48], [1, 0])
  const sharedCardGradientOpacity = useTransform(visualProgress, [0.5, 0.76], [0, 1])
  // Drives the caption on `SharedCloudTransitionImage` ONLY — `CloudShowcaseCard`'s own caption
  // has no independent fade; it's just as much "the real card" as everything else in that figure,
  // so it's covered entirely by `targetCardOpacity` (0 the whole morph, 1 only after hand-off).
  // Starts later than the shared image's geometry morph itself (which runs the whole [0, 1]): early
  // on this still has to read as Hero, not as a card-in-waiting, so the name/badge only appear once
  // the shrinking visual is already close to the card's actual proportions.
  const cloudLabelOpacity = useTransform(visualProgress, [0.7, 0.9], [0, 1])

  // NOT driven by scroll progress, and NOT by asset readiness either (`sharedAssetReady`) — only
  // by `sharedActive`, which a user gesture sets. Hero's own in-flow `<img>` must stay the visible
  // layer through the ENTIRE route entrance (`PageTransition`'s transform, however long it takes)
  // and while at rest at Hero; it only disappears once a forward transition actually begins. If
  // this instead depended on readiness (assets typically finish decoding well before the route
  // entrance animation does), the portal — fixed to `document.body`, unaffected by that transform
  // — would take over from Hero's still-animating in-flow image and visibly jump between the two
  // coordinate spaces. See `sharedActive`'s declaration above for the only two places it moves.
  const heroSourceOpacity = useTransform(sharedActive, [0, 1], [1, 0])
  // Deliberately NOT a complementary crossfade (`shared: 1→0` + `target: 0→1` at the same time) —
  // two overlapping images at fractional alpha dim/soften the frame in between via alpha
  // compositing, which reads as a flicker even when their rects match exactly. Instead, the shared
  // image is a hard on/off layer — visible only once its asset is ready AND a gesture has actually
  // activated it AND it hasn't yet handed off to the real card image — that only ever switches off
  // once the real card (`targetCardOpacity` = `handoffProgress`) underneath it has already reached
  // full opacity. See the hand-off sequencing in `animatePageScrollTo`.
  const sharedImageOpacity = useTransform(
    [sharedAssetReady, sharedActive, sharedLayerVisible],
    ([ready, active, visible]) => Number(ready) * Number(active) * Number(visible),
  )
  // Applied to the ENTIRE `CloudShowcaseCard` figure (background, gradient, shadow, caption — not
  // just its `<img>`), so the real card is completely invisible, not just missing its picture,
  // until the moment `animatePageScrollTo`'s hand-off animation explicitly reveals it.
  const targetCardOpacity = handoffProgress

  // Hero copy — fades/rises early, and stops intercepting clicks once mostly faded.
  const heroCopyOpacity = useTransform(visualProgress, TIMELINE.heroCopy, [1, 0])
  const heroCopyY = useTransform(visualProgress, TIMELINE.heroCopy, [0, -24])
  const heroCopyPointerEvents = useTransform(heroCopyOpacity, [0, 0.5], ['none', 'auto'])

  const headingOpacity = useTransform(visualProgress, TIMELINE.productHeading, [0, 1])
  const headingY = useTransform(visualProgress, TIMELINE.productHeading, [18, 0])

  const kasperskyOpacity = useTransform(visualProgress, TIMELINE.kasperskyOpacity, [0, 1])
  const kasperskyX = useTransform(visualProgress, TIMELINE.kasperskyTransform, [-52, 0])
  const kasperskyY = useTransform(visualProgress, TIMELINE.kasperskyTransform, [16, 0])
  const kasperskyScale = useTransform(visualProgress, TIMELINE.kasperskyTransform, [0.96, 1])

  const esimOpacity = useTransform(visualProgress, TIMELINE.esimOpacity, [0, 1])
  const esimX = useTransform(visualProgress, TIMELINE.esimTransform, [52, 0])
  const esimY = useTransform(visualProgress, TIMELINE.esimTransform, [16, 0])
  const esimScale = useTransform(visualProgress, TIMELINE.esimTransform, [0.96, 1])

  return (
    <div ref={experienceRef} className="relative bg-home-ink">
      <section
        ref={heroSectionRef}
        className="pointer-events-none sticky top-0 z-40 h-[100svh] w-full overflow-hidden"
      >
        <div ref={heroVisualRef} className="absolute inset-0">
          <motion.img
            src={HERO_IMAGE}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: heroSourceOpacity }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-home-ink via-home-ink/25 to-home-ink/55"
            style={{ opacity: heroSourceOpacity }}
          />
        </div>

        <motion.div
          className="pointer-events-auto relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
          style={{ opacity: heroCopyOpacity, y: heroCopyY, pointerEvents: heroCopyPointerEvents }}
        >
          <span className="inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em] text-home-wire">
            <span className="size-1.5 rounded-full bg-home-wire" />
            VTC TELECOM // CLOUD PLATFORM
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-home-paper sm:text-5xl lg:text-[3.4rem]">
            Hạ tầng đám mây cho doanh nghiệp số
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-home-paper/65">
            Triển khai máy chủ ảo, mở rộng tài nguyên theo nhu cầu và vận hành ổn định 24/7 trên nền tảng
            điện toán đám mây thế hệ mới.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={ROUTES.PRODUCTS_CLOUD}
              className="group inline-flex items-center gap-2 rounded-md bg-home-beacon px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,102,179,0.55)] transition-colors hover:bg-home-beacon/90 focus-ring"
            >
              Khám phá Cloud
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-md border border-home-paper/20 px-6 py-3 text-sm font-semibold text-home-paper transition-colors hover:border-home-paper/40 hover:bg-home-paper/5 focus-ring"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </motion.div>
      </section>

      <section
        ref={productSectionRef}
        className="relative z-20 flex min-h-[100svh] w-full flex-col items-center justify-center gap-10 rounded-t-[48px] bg-white px-6 py-20 sm:px-8 lg:gap-14 lg:px-10 lg:py-24"
      >
        <motion.div className="max-w-2xl text-center" style={{ opacity: headingOpacity, y: headingY }}>
          <span className="inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em] text-home-beacon">
            <span className="size-1.5 rounded-full bg-home-beacon" />
            MỘT NỀN TẢNG · BA DỊCH VỤ
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-home-graphite sm:text-3xl">
            Mọi hạ tầng số bạn cần, trong một nền tảng duy nhất
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-home-graphite-soft sm:text-base">
            Từ điện toán đám mây, bảo mật endpoint đến kết nối dữ liệu toàn cầu — quản lý tất cả trong một
            tài khoản VTC Telecom.
          </p>
        </motion.div>

        <div className="grid w-full max-w-7xl grid-cols-3 items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-6">
          <ShowcaseProductCard
            product={PRODUCTS.kaspersky}
            imageClassName={SIDE_SHOWCASE_CLASS}
            motionStyle={{
              opacity: kasperskyOpacity,
              x: kasperskyX,
              y: kasperskyY,
              scale: kasperskyScale,
            }}
          />

          <CloudShowcaseCard
            product={PRODUCTS.cloud}
            slotRef={cloudTargetSlotRef}
            targetCardOpacity={targetCardOpacity}
          />

          <ShowcaseProductCard
            product={PRODUCTS.esim}
            imageClassName={SIDE_SHOWCASE_CLASS}
            motionStyle={{
              opacity: esimOpacity,
              x: esimX,
              y: esimY,
              scale: esimScale,
            }}
          />
        </div>
      </section>

      {typeof document !== 'undefined' &&
        createPortal(
          <SharedCloudTransitionImage
            top={sharedTop}
            left={sharedLeft}
            width={sharedWidth}
            height={sharedHeight}
            borderRadius={sharedRadius}
            objectPosition={sharedObjectPosition}
            heroGradientOpacity={sharedHeroGradientOpacity}
            cardGradientOpacity={sharedCardGradientOpacity}
            opacity={sharedImageOpacity}
            labelOpacity={cloudLabelOpacity}
            product={PRODUCTS.cloud}
          />,
          document.body,
        )}
    </div>
  )
}

/** The three lines of text laid over every showcase visual (Kaspersky, eSIM, and — via
 *  `CloudShowcaseCard`/`SharedCloudTransitionImage` — Cloud): a small eyebrow, the product name,
 *  and a short descriptor pill. Pure content, no positioning of its own — callers wrap it in
 *  whatever absolutely-positioned container fits their layer (a static `<figcaption>` for the two
 *  side cards, a `motion.div` with an animated opacity for Cloud, which fades in mid-morph). */
function ShowcaseCaption({ label, name, badge }: { label: string; name: string; badge: string }) {
  return (
    <>
      <span className="font-data text-[10px] uppercase tracking-[0.18em] text-white/65">{label}</span>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white lg:text-3xl">{name}</h3>
      <span className="mt-3 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 font-data text-[10px] uppercase tracking-[0.12em] text-white/85 backdrop-blur-sm">
        {badge}
      </span>
    </>
  )
}

/** A pure visual — not a link, not a button, nothing to click. Kaspersky and eSIM use this
 *  directly on desktop (`variant="scroll"`, driven by `motionStyle`) and all three products use it
 *  on mobile (`variant="reveal"`, a simple `whileInView` fade — see `SimplifiedHero`). Cloud on
 *  desktop needs its own `CloudShowcaseCard` instead, since it also has to be the real shared-image
 *  morph target (measured rect, real-image hand-off, animated caption) — this component has none
 *  of that machinery. */
function ShowcaseProductCard({
  product,
  imageClassName,
  className,
  objectPosition = '50% 50%',
  variant = 'scroll',
  motionStyle,
  revealDelay = 0,
}: {
  product: ShowcaseProduct
  imageClassName: string
  className?: string
  objectPosition?: string
  variant?: 'scroll' | 'reveal'
  motionStyle?: MotionStyle
  revealDelay?: number
}) {
  const variantProps =
    variant === 'scroll'
      ? { style: motionStyle }
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.55, delay: revealDelay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <motion.figure
      className={cn(
        'relative isolate overflow-hidden rounded-[28px] bg-home-ink',
        'transform-gpu [backface-visibility:hidden]',
        imageClassName,
        className,
      )}
      {...variantProps}
    >
      <img
        src={product.image}
        alt={product.name}
        width={640}
        height={800}
        loading="eager"
        decoding="async"
        className="absolute inset-0 block h-full w-full object-cover"
        style={{ objectPosition }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-home-ink/80 via-home-ink/10 to-home-ink/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_30%,rgba(5,27,51,0.22)_100%)]" />

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-7 text-center text-white">
        <ShowcaseCaption label={product.label} name={product.name} badge={product.badge} />
      </figcaption>
    </motion.figure>
  )
}

/** The single shared Cloud visual: one continuous image element that morphs from Hero's real,
 *  measured box (`sourceRect`) straight to the Product Lineup Cloud card's real, measured rect
 *  (`targetRect` — now the ENTIRE `CloudShowcaseCard`, not just an image slot above a white body).
 *  Portaled into `document.body` as `position: fixed` (see the `HeroProductsExperience` doc
 *  comment for why a portal, not a plain fixed sibling, is required in this app). Stacking:
 *  Product Lineup z-20 < this image z-30 < Hero z-40 < site navigation (z-40 today) — Hero's own
 *  copy needs to stay above this image early in the transition (both are showing literally the
 *  same pixels at that point, so overlap is invisible), and this image needs to stay above Product
 *  Lineup for the whole transition so it never gets painted over. Renders the SAME `ShowcaseCaption`
 *  content `CloudShowcaseCard` will reveal once it hands off, faded in here on `labelOpacity` —
 *  this is the ONLY Cloud caption visible during the morph, since `CloudShowcaseCard`'s own copy
 *  stays fully covered by `targetCardOpacity` until the hand-off in `animatePageScrollTo` runs. */
function SharedCloudTransitionImage({
  top,
  left,
  width,
  height,
  borderRadius,
  objectPosition,
  heroGradientOpacity,
  cardGradientOpacity,
  opacity,
  labelOpacity,
  product,
}: {
  top: MotionValue<number>
  left: MotionValue<number>
  width: MotionValue<number>
  height: MotionValue<number>
  borderRadius: MotionValue<string>
  objectPosition: MotionValue<string>
  heroGradientOpacity: MotionValue<number>
  cardGradientOpacity: MotionValue<number>
  opacity: MotionValue<number>
  labelOpacity: MotionValue<number>
  product: ShowcaseProduct
}) {
  return (
    <motion.div
      className="pointer-events-none fixed z-30 overflow-hidden transform-gpu [contain:layout_paint] [backface-visibility:hidden]"
      style={{
        top,
        left,
        width,
        height,
        borderRadius,
        opacity,
        willChange: 'top, left, width, height, border-radius, opacity',
      }}
    >
      <motion.img
        src={HERO_IMAGE}
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 block h-full w-full object-cover transform-gpu [backface-visibility:hidden] [will-change:opacity]"
        style={{ objectPosition }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-home-ink via-home-ink/25 to-home-ink/55"
        style={{ opacity: heroGradientOpacity }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-home-ink/80 via-home-ink/5 to-home-ink/10"
        style={{ opacity: cardGradientOpacity }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_30%,rgba(5,27,51,0.22)_100%)]"
        style={{ opacity: cardGradientOpacity }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-7 text-center text-white"
        style={{ opacity: labelOpacity }}
      >
        <ShowcaseCaption label={product.label} name={product.name} badge={product.badge} />
      </motion.div>
    </motion.div>
  )
}

/** The Cloud showcase as it really lives inside Product Lineup — a real, full-image visual, not a
 *  commerce card. `slotRef` (`cloudTargetSlotRef`) sits on THIS ENTIRE `<figure>`, not on a nested
 *  image slot — `measureRects` now measures the whole rounded-rect visual, so `targetRect` (and
 *  the shared image's geometry/radius) always matches exactly what this renders, at whatever size
 *  `CLOUD_SHOWCASE_CLASS` currently resolves to.
 *
 *  `targetCardOpacity` (= `handoffProgress`) is applied to the WHOLE `<motion.figure>`, not just
 *  the `<img>` inside it — the dark `bg-home-ink` shell, gradient, vignette, shadow, and caption
 *  are all just as much "the real card" as the image is. Opacity-ing only the image left every
 *  other layer permanently visible underneath the shrinking shared image, so a fully-dressed Cloud
 *  card (background, gradient, shadow, caption) was visible sitting in place well before the
 *  morph finished — looking like the shared image was landing ON TOP of an already-existing card
 *  rather than becoming it. With opacity on the figure itself, the real card is entirely invisible
 *  (but still fully present in layout, still exactly what `slotRef` measures) until the hand-off
 *  animation in `animatePageScrollTo` explicitly reveals it — see that function's doc comment. */
function CloudShowcaseCard({
  product,
  slotRef,
  targetCardOpacity,
}: {
  product: ShowcaseProduct
  slotRef: React.RefObject<HTMLElement | null>
  targetCardOpacity: MotionValue<number>
}) {
  return (
    <motion.figure
      ref={slotRef}
      className={cn(
        'relative isolate overflow-hidden rounded-[28px] bg-home-ink',
        'transform-gpu [backface-visibility:hidden] [will-change:opacity] lg:z-10',
        CLOUD_SHOWCASE_CLASS,
      )}
      style={{ opacity: targetCardOpacity }}
    >
      <img
        src={HERO_IMAGE}
        alt={product.name}
        width={640}
        height={800}
        loading="eager"
        decoding="async"
        className="absolute inset-0 block h-full w-full object-cover transform-gpu [backface-visibility:hidden]"
        style={{ objectPosition: '72% 52%' }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-home-ink/80 via-home-ink/5 to-home-ink/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_30%,rgba(5,27,51,0.22)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-7 text-center text-white">
        <ShowcaseCaption label={product.label} name={product.name} badge={product.badge} />
      </div>
    </motion.figure>
  )
}

/** Mobile/tablet and reduced-motion fallback: two real sections, same as desktop conceptually,
 *  just without the sticky pin, shared image, or measured rects — plain native scrolling with
 *  cards revealed via `whileInView` as they enter the viewport. Real images in both Hero and the
 *  Cloud card, no shared-element morph. */
function SimplifiedHero() {
  const cards = [PRODUCTS.cloud, PRODUCTS.kaspersky, PRODUCTS.esim]

  return (
    <div className="relative bg-home-ink font-plex">
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <img src={HERO_IMAGE} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-home-ink via-home-ink/50 to-home-ink/75" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em] text-home-wire">
            <span className="size-1.5 rounded-full bg-home-wire" />
            VTC TELECOM // CLOUD PLATFORM
          </span>
          <h1 className="mt-6 max-w-md font-display text-3xl font-semibold leading-[1.15] tracking-tight text-home-paper sm:text-4xl">
            Hạ tầng đám mây cho doanh nghiệp số
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-home-paper/65 sm:text-base">
            Triển khai máy chủ ảo, mở rộng tài nguyên theo nhu cầu và vận hành ổn định 24/7.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to={ROUTES.PRODUCTS_CLOUD}
              className="inline-flex items-center gap-2 rounded-md bg-home-beacon px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,102,179,0.55)] focus-ring"
            >
              Khám phá Cloud
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-md border border-home-paper/20 px-6 py-3 text-sm font-semibold text-home-paper focus-ring"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 rounded-t-[40px] bg-home-paper px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-md text-center">
          <span className="inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em] text-home-beacon">
            <span className="size-1.5 rounded-full bg-home-beacon" />
            MỘT NỀN TẢNG · BA DỊCH VỤ
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-home-graphite sm:text-3xl">
            Mọi hạ tầng số bạn cần, trong một nền tảng duy nhất
          </h2>
          <p className="mt-3 text-sm leading-6 text-home-graphite-soft">
            Từ điện toán đám mây, bảo mật endpoint đến kết nối dữ liệu toàn cầu — quản lý tất cả trong một
            tài khoản VTC Telecom.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-md flex-col gap-6">
          {cards.map((product, index) => (
            <ShowcaseProductCard
              key={product.id}
              product={product}
              variant="reveal"
              revealDelay={index * 0.08}
              imageClassName={MOBILE_SHOWCASE_CLASS}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
