import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20',
  secondary: 'bg-secondary text-white hover:opacity-90',
  outline: 'border border-border text-text-primary hover:bg-surface',
  ghost: 'text-text-primary hover:bg-surface',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-7 py-3.5 rounded-xl gap-2',
}

const gapClasses: Record<ButtonSize, string> = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
}

const shineGlowClasses =
  'hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06),0_0_20px_-4px_rgba(255,255,255,0.25)]'

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
  shine = false,
) {
  return cn(
    'inline-flex items-center justify-center font-medium whitespace-nowrap',
    'disabled:opacity-50 disabled:pointer-events-none focus-ring',
    variantClasses[variant],
    sizeClasses[size],
    shine
      ? [
          'group relative isolate overflow-hidden',
          'transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'motion-safe:hover:-translate-y-px active:scale-[0.98]',
          shineGlowClasses,
        ]
      : ['transition-all duration-200', 'active:scale-[0.97]'],
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /** Adds a Linear/Vercel-style light sweep that reverses smoothly on mouse leave. */
  shine?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      shine = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const content = (
      <>
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading &&
          (shine && rightIcon ? (
            <span className="inline-flex transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:translate-x-[2px]">
              {rightIcon}
            </span>
          ) : (
            rightIcon
          ))}
      </>
    )

    return (
      <button
        ref={ref}
        className={buttonClasses(variant, size, className, shine)}
        disabled={disabled || isLoading}
        {...props}
      >
        {shine && (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 -left-20 z-0 w-16 -skew-x-[18deg] blur-[1px]',
              'bg-gradient-to-r from-transparent via-white/50 to-transparent',
              'transition-[left,transform] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'group-hover:left-full',
              'motion-reduce:hidden',
            )}
          />
        )}
        {shine ? (
          <span className={cn('relative z-10 inline-flex items-center', gapClasses[size])}>
            {content}
          </span>
        ) : (
          content
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'
