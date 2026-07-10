import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface MarqueeProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
  getKey: (item: T) => string
  className?: string
  durationSeconds?: number
  gapClassName?: string
}

/**
 * Infinite horizontal scroller (landing-page "logo wall" style). Renders the item list
 * twice back-to-back and animates the track by exactly one set's width (-50%), so the
 * loop is seamless. Pauses on hover; respects prefers-reduced-motion globally via
 * the animation-duration override in index.css.
 */
export function Marquee<T>({
  items,
  renderItem,
  getKey,
  className,
  durationSeconds = 24,
  gapClassName = 'gap-x-12',
}: MarqueeProps<T>) {
  const loopItems = [...items, ...items]

  return (
    <div
      className={cn(
        'group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        className,
      )}
    >
      <div
        className={cn('flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]', gapClassName)}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {loopItems.map((item, index) => (
          <div key={`${getKey(item)}-${index}`} aria-hidden={index >= items.length} className="shrink-0">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
