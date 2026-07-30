import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

export type CheckoutStep = 1 | 2 | 3

interface CheckoutStepperProps {
  currentStep: CheckoutStep
  className?: string
}

/** Three-step progress indicator shared by every route in the checkout flow. */
export function CheckoutStepper({ currentStep, className }: CheckoutStepperProps) {
  const { t } = useTranslation()
  const steps = [t('checkout.steps.information'), t('checkout.steps.payment'), t('checkout.steps.complete')]

  return (
    <nav aria-label={t('checkout.title')} className={cn('w-full', className)}>
      <p className="text-sm font-medium text-text-secondary sm:hidden">
        {t('checkout.steps.mobileProgress', { current: currentStep, total: steps.length })}
        <span className="ml-2 text-text-primary">{steps[currentStep - 1]}</span>
      </p>

      <ol className="hidden items-center sm:flex">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1
          const isDone = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          const isLast = stepNumber === steps.length

          return (
            <li key={label} className={cn('flex items-center', !isLast && 'flex-1')}>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isDone && 'bg-emerald-50 text-emerald-600',
                    isActive && 'bg-primary text-white',
                    !isDone && !isActive && 'bg-surface text-text-secondary',
                  )}
                >
                  {isDone ? <Check className="size-3.5" /> : stepNumber}
                </span>
                <span
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'text-sm font-medium',
                    isDone || isActive ? 'text-text-primary' : 'text-text-secondary',
                  )}
                >
                  {label}
                </span>
              </div>
              {!isLast && <div className={cn('mx-3 h-px flex-1', isDone ? 'bg-emerald-200' : 'bg-border')} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
