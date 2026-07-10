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
            'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest',
            light
              ? 'border border-white/15 bg-white/10 text-accent'
              : 'border border-primary/15 bg-primary/10 text-primary',
          )}
        >
          <span className={cn('size-1.5 rounded-full', light ? 'bg-accent' : 'bg-primary')} />
          {eyebrow}
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
