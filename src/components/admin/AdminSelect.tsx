import { useId } from 'react'
import type { ReactNode } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Radix Select.Item forbids an empty-string value, so filter dropdowns that need an
 *  explicit "All" entry (replacing an unselected/placeholder state) map to/from this
 *  sentinel at the call site instead of using `''` directly. */
export const ALL_FILTER_VALUE = '__all__'

export interface AdminSelectOption {
  value: string
  label: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
}

export interface AdminSelectProps {
  label?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  options: AdminSelectOption[]
  onValueChange?: (value: string) => void
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  /** Leading icon inside the trigger — mainly for `variant="filter"` (e.g. a Filter icon). */
  icon?: ReactNode
  size?: 'sm' | 'md'
  /** `filter`: compact ~40px toolbar control. `form`: full-width, matches Input sizing. */
  variant?: 'form' | 'filter'
  name?: string
  id?: string
  className?: string
  contentClassName?: string
}

// `filter` uses a fixed compact height to sit flush with SearchBar in a toolbar.
// `form` mirrors Input's own padding (`px-4 py-2.5`) instead of a fixed height,
// so the two stay pixel-identical without duplicating a magic height value.
const TRIGGER_SIZE_CLASSES: Record<'form' | 'filter', Record<'sm' | 'md', string>> = {
  filter: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-3.5 text-sm',
  },
  form: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
  },
}

/**
 * Shared Admin dropdown, built on Radix Select so keyboard nav, focus
 * management, and portal-based positioning (no clipping inside tables,
 * drawers, or modals) come for free instead of being reimplemented.
 */
export function AdminSelect({
  label,
  value,
  defaultValue,
  placeholder,
  options,
  onValueChange,
  error,
  helperText,
  disabled,
  required,
  icon,
  size = 'md',
  variant = 'form',
  name,
  id,
  className,
  contentClassName,
}: AdminSelectProps) {
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const labelId = `${triggerId}-label`
  const errorId = `${triggerId}-error`
  const hintId = `${triggerId}-hint`

  const selectedOption = options.find((opt) => opt.value === value)
  const isFilter = variant === 'filter'

  return (
    <div className={cn('flex flex-col gap-1.5', isFilter && 'w-full sm:w-auto')}>
      {label && (
        <label id={labelId} htmlFor={triggerId} className="text-sm font-medium text-admin-text">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <RadixSelect.Trigger
          id={triggerId}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? hintId : undefined}
          className={cn(
            'group flex w-full items-center gap-2 rounded-xl border border-admin-border bg-admin-surface text-admin-text',
            'transition-colors duration-150 outline-none',
            'hover:border-admin-border-strong',
            'data-[placeholder]:text-admin-text-muted',
            'data-[state=open]:border-admin-primary data-[state=open]:ring-2 data-[state=open]:ring-admin-primary/15',
            'focus-visible:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/15',
            'aria-invalid:border-red-400 aria-invalid:data-[state=open]:ring-red-400/15 aria-invalid:focus-visible:ring-red-400/15',
            'disabled:cursor-not-allowed disabled:opacity-50',
            TRIGGER_SIZE_CLASSES[variant][size],
            !isFilter && 'justify-between',
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {icon && <span className="shrink-0 text-admin-text-muted">{icon}</span>}
            <RadixSelect.Value placeholder={placeholder} className="block truncate text-left">
              {selectedOption?.label}
            </RadixSelect.Value>
          </span>
          <RadixSelect.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-admin-text-muted transition-transform duration-150 group-data-[state=open]:rotate-180" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className={cn(
              'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[11px] border border-admin-border bg-admin-surface p-1.5',
              'shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]',
              'data-[state=open]:animate-[admin-select-in_160ms_ease-out] data-[state=closed]:animate-[admin-select-out_120ms_ease-in]',
              contentClassName,
            )}
          >
            <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-admin-text-muted">
              <ChevronDown className="size-3.5 rotate-180" />
            </RadixSelect.ScrollUpButton>
            <RadixSelect.Viewport className="max-h-[300px] overflow-y-auto">
              {options.length === 0 ? (
                <p className="px-2.5 py-2 text-sm text-admin-text-muted">—</p>
              ) : (
                options.map((opt) => (
                  <RadixSelect.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className={cn(
                      'relative flex min-h-9 cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-2.5 pr-8 text-sm text-admin-text outline-none',
                      'data-[highlighted]:bg-admin-surface-muted',
                      'data-[state=checked]:bg-admin-primary-soft data-[state=checked]:font-medium',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    )}
                  >
                    {opt.icon && <span className="shrink-0 text-admin-text-muted">{opt.icon}</span>}
                    <span className="flex min-w-0 flex-col">
                      <RadixSelect.ItemText>
                        <span className="block truncate">{opt.label}</span>
                      </RadixSelect.ItemText>
                      {opt.description && (
                        <span className="block truncate text-xs text-admin-text-muted">
                          {opt.description}
                        </span>
                      )}
                    </span>
                    <RadixSelect.ItemIndicator className="absolute right-2.5 flex items-center text-admin-primary">
                      <Check className="size-4" />
                    </RadixSelect.ItemIndicator>
                  </RadixSelect.Item>
                ))
              )}
            </RadixSelect.Viewport>
            <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-admin-text-muted">
              <ChevronDown className="size-3.5" />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={hintId} className="text-xs text-admin-text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}
