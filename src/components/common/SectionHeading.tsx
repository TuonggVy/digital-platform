import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
  light?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  light,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest',
            light
              ? 'border border-white/[0.08] bg-home-ink/55 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
              : 'border border-primary/15 bg-primary/10 text-primary',
          )}
        >
          {light && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.035] to-transparent"
            />
          )}
          <span
            className={cn(
              'relative z-10 size-1.5 rounded-full',
              light ? 'bg-accent' : 'bg-primary',
            )}
          />
          <span className="relative z-10">{eyebrow}</span>
        </span>
      )}
      <h2
        className={cn(
          'text-3xl font-semibold tracking-tight sm:text-4xl',
          light ? 'text-white' : 'text-text-primary',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('max-w-2xl text-base', light ? 'text-slate-300' : 'text-text-secondary')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
