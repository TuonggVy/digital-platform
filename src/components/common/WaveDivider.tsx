import { cn } from '@/utils/cn'

interface WaveDividerProps {
  /** Tailwind fill-* class matching the color it should blend into. */
  fillClassName: string
  position?: 'top' | 'bottom'
  flip?: boolean
  className?: string
}

/**
 * Decorative SVG "chapter break" divider used instead of hard border lines between
 * sections. Sits exactly on the section edge; its fill color should match the
 * background of the section it blends into, creating a soft wave seam.
 */
export function WaveDivider({ fillClassName, position = 'bottom', flip = false, className }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 z-10 h-16 overflow-hidden leading-none sm:h-24',
        position === 'bottom' ? 'bottom-0' : 'top-0',
        flip && 'rotate-180',
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <path
          d="M0,64 C240,120 480,0 720,32 C960,64 1200,8 1440,56 L1440,120 L0,120 Z"
          className={fillClassName}
        />
      </svg>
    </div>
  )
}
