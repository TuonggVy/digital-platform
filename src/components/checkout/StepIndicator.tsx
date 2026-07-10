import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

/** Simple 1-indexed horizontal progress indicator for the checkout flow. */
export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <ol className={cn('flex items-center', className)}>
      {steps.map((label, idx) => {
        const stepNumber = idx + 1
        const isDone = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        const isLast = stepNumber === steps.length

        return (
          <li key={label} className={cn('flex items-center', !isLast && 'flex-1')}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  isDone && 'border-primary bg-primary text-white',
                  isActive && 'border-primary text-primary',
                  !isDone && !isActive && 'border-border text-text-secondary',
                )}
              >
                {isDone ? <Check className="size-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  isDone || isActive ? 'text-text-primary' : 'text-text-secondary',
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn('mx-2 h-px flex-1 sm:mx-4', isDone ? 'bg-primary' : 'bg-border')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
