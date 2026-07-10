import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-start gap-2.5 text-sm text-text-primary"
        >
          <span className="relative mt-0.5 inline-flex size-5 shrink-0 items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              className={cn(
                'peer size-5 shrink-0 cursor-pointer appearance-none rounded-md border border-border',
                'checked:border-primary checked:bg-primary focus-ring',
                className,
              )}
              {...props}
            />
            <Check className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100" />
          </span>
          {label}
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'
