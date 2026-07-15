import { useCallback, useRef } from 'react'
import type { CSSProperties, ComponentPropsWithoutRef, MouseEvent } from 'react'
import { cn } from '@/utils/cn'

export interface SpotlightCardProps extends ComponentPropsWithoutRef<'div'> {
  spotlightSize?: number
  spotlightColor?: string
  disableSpotlight?: boolean
  /**
   * Chrome palette for the card surface — independent from the spotlight glow.
   * 'dark': translucent white glass chrome, for cards sitting on dark sections.
   * 'light': solid surface matching the site's default light card style.
   * 'none': no border/shadow/hover-motion/base layer of its own — the
   * cursor-tracking spotlight glow is added on top of chrome fully owned
   * by the consumer's own className.
   */
  tone?: 'dark' | 'light' | 'none'
}

const TONE_STYLES = {
  dark: {
    border: 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.10)]',
    shadow:
      'shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_30px_rgba(0,0,0,0.28),0_30px_80px_rgba(0,0,0,0.18)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.38),0_0_60px_rgba(94,106,210,0.08)]',
    base: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))]',
    topHighlight: 'bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]',
  },
  light: {
    border: 'border-border hover:border-black/10',
    shadow: 'shadow-sm hover:shadow-xl hover:shadow-primary/10',
    base: 'bg-background',
    topHighlight: 'bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.14),transparent)]',
  },
} as const

export function SpotlightCard({
  className,
  style,
  children,
  spotlightSize = 340,
  spotlightColor = 'rgba(94, 106, 210, 0.15)',
  disableSpotlight = false,
  tone = 'dark',
  onMouseMove,
  onMouseEnter,
  ...rest
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const updateSpotlightPosition = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    card.style.setProperty('--spotlight-x', `${x}px`)
    card.style.setProperty('--spotlight-y', `${y}px`)
  }, [])

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    onMouseMove?.(event)
    if (!disableSpotlight) updateSpotlightPosition(event)
  }

  function handleMouseEnter(event: MouseEvent<HTMLDivElement>) {
    onMouseEnter?.(event)
    if (!disableSpotlight) updateSpotlightPosition(event)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      style={
        {
          '--spotlight-size': `${spotlightSize}px`,
          '--spotlight-color': spotlightColor,
          '--spotlight-x': '50%',
          '--spotlight-y': '50%',
          ...style,
        } as CSSProperties
      }
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        tone !== 'none' && [
          'border',
          TONE_STYLES[tone].border,
          TONE_STYLES[tone].shadow,
          'transition-[transform,box-shadow,border-color] duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          'motion-safe:hover:-translate-y-[2px] motion-safe:active:scale-[0.99]',
        ],
        className,
      )}
      {...rest}
    >
      {/* 1. background / base layer — skipped when chromeless, className owns the surface */}
      {tone !== 'none' && (
        <div
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-0', TONE_STYLES[tone].base)}
        />
      )}

      {/* 2. spotlight layer — follows the cursor via CSS variables, never intercepts clicks */}
      {!disableSpotlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(var(--spotlight-size) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 65%)',
          }}
        />
      )}

      {/* 3. inner top highlight — skipped when chromeless */}
      {tone !== 'none' && (
        <div
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-x-0 top-0 h-px', TONE_STYLES[tone].topHighlight)}
        />
      )}

      {/* 4. content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
