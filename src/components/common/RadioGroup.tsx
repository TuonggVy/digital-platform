import { cn } from '@/utils/cn'

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  name: string
  value: string
  options: RadioOption[]
  onChange: (value: string) => void
  className?: string
}

export function RadioGroup({ name, value, options, onChange, className }: RadioGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} role="radiogroup">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors',
            value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface',
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 size-4 accent-[var(--primary)]"
          />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">{opt.label}</span>
            {opt.description && (
              <span className="text-xs text-text-secondary">{opt.description}</span>
            )}
          </span>
        </label>
      ))}
    </div>
  )
}
