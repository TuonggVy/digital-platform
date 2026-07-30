import type { KeyboardEvent, ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaymentMethodCardProps {
  icon: ReactNode
  label: string
  description: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

/** Selectable payment-method card — not a native radio input, so it implements the role itself. */
export function PaymentMethodCard({ icon, label, description, selected, onSelect, disabled }: PaymentMethodCardProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={handleKeyDown}
      className={cn(
        'focus-ring flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          selected ? 'bg-primary/10 text-primary' : 'bg-surface text-text-secondary',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-primary bg-primary text-white' : 'border-border',
        )}
      >
        {selected && <Check className="size-3" />}
      </span>
    </div>
  )
}
