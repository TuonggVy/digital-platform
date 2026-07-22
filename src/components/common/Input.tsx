import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  /** Right-aligned slot — e.g. a password show/hide button. Rendered as-is, so pass an interactive element with its own accessible name. */
  rightIcon?: ReactNode
  /** 'dark' renders the field for a dark/navy surface (e.g. the auth card) — same behavior, different chrome. */
  tone?: 'light' | 'dark'
}

const INPUT_TONE_CLASSES = {
  light: {
    label: 'text-text-primary',
    field:
      'border-border bg-background text-text-primary placeholder:text-text-secondary focus:border-primary',
    icon: 'text-text-secondary',
    error: 'text-red-500',
    hint: 'text-text-secondary',
  },
  dark: {
    label: 'text-white/90',
    field: 'border-white/15 bg-white/[0.06] text-white placeholder:text-white/40 focus:border-accent',
    icon: 'text-white/50',
    error: 'text-red-400',
    hint: 'text-white/50',
  },
} as const

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, tone = 'light', className, id, ...props }, ref) => {
    const inputId = id ?? props.name
    const toneClasses = INPUT_TONE_CLASSES[tone]
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={cn('text-sm font-medium', toneClasses.label)}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span
              className={cn(
                'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2',
                toneClasses.icon,
              )}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              toneClasses.field,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && (tone === 'dark' ? 'border-red-400/60' : 'border-red-500'),
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className={cn('absolute right-3 top-1/2 -translate-y-1/2', toneClasses.icon)}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className={cn('text-xs', toneClasses.error)}>
            {error}
          </p>
        )}
        {hint && !error && <p className={cn('text-xs', toneClasses.hint)}>{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary',
            'placeholder:text-text-secondary transition-colors focus-ring focus:border-primary min-h-[120px] resize-y',
            error && 'border-red-500',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-text-secondary">{hint}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
