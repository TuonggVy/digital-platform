import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ToastContainer } from '@/components/common/Toast'
import { cn } from '@/utils/cn'
import { CheckoutStepper, type CheckoutStep } from './CheckoutStepper'

interface CheckoutLayoutProps {
  backTo: string
  backLabel: string
  currentStep: CheckoutStep
  /** Desktop-only left column (the unified product-review card) — hidden on mobile in favor of `mobileSummary`. */
  left: ReactNode
  /** Mobile-only collapsible order summary, rendered above the main card. */
  mobileSummary?: ReactNode
  /** Right column content (form or payment methods) — full width on mobile. */
  children: ReactNode
  /**
   * Optional "back to previous step" affordance rendered above the stepper in
   * the right card — e.g. PaymentPage switching back to its own Information
   * view. This is a local view change within the current page (not a route),
   * since once an order exists there's no "re-submit the info step" route to
   * navigate back to.
   */
  onBackStep?: () => void
  backStepLabel?: string
}

/**
 * Checkout-specific page shell — deliberately not the marketing `PublicLayout`
 * (no site nav, no footer) so Checkout/Payment/VNPay-return stay focused. Owns
 * the two-column split, the shared stepper (rendered inside the right card,
 * not above the grid), and its own `ToastContainer` since these routes render
 * outside `PublicLayout` (see AppRoutes.tsx).
 *
 * Cards size to their own content (no forced full-viewport stretch) so the
 * right card never clips content that needs scrolling to reach — if content
 * is ever taller than the viewport, the page scrolls normally. On desktop,
 * the back link and the left card are grouped together and vertically
 * centered within the row (matched to the right card's height); on mobile
 * the back link stays pinned at the top of the normal document flow.
 */
export function CheckoutLayout({
  backTo,
  backLabel,
  currentStep,
  left,
  mobileSummary,
  children,
  onBackStep,
  backStepLabel,
}: CheckoutLayoutProps) {
  const backLink = (
    <Link
      to={backTo}
      className="focus-ring inline-flex w-fit items-center gap-1.5 rounded text-sm font-medium text-text-secondary transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {backLabel}
    </Link>
  )

  return (
    <div className="min-h-screen bg-surface">
      <ToastContainer />
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Mobile: back link pinned at the top of normal document flow. Desktop: folded into the centered left-column group below instead. */}
        <div className="lg:hidden">{backLink}</div>

        <div
          className={cn(
            'grid grid-cols-1 gap-6 lg:gap-8',
            left ? 'lg:grid-cols-[minmax(0,0.84fr)_minmax(480px,1fr)]' : 'lg:grid-cols-1',
          )}
        >
          {left ? (
            <div className="hidden lg:flex lg:flex-col lg:justify-center lg:gap-4">
              {backLink}
              {left}
            </div>
          ) : (
            <div className="hidden lg:block">{backLink}</div>
          )}

          {mobileSummary && <div className="lg:hidden">{mobileSummary}</div>}

          <main
            className={cn(
              'flex min-w-0 flex-col rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-8 lg:p-10',
              !left && 'mx-auto w-full max-w-2xl',
            )}
          >
            {onBackStep && (
              <button
                type="button"
                onClick={onBackStep}
                className="focus-ring mb-5 inline-flex w-fit items-center gap-1.5 rounded text-sm font-medium text-text-secondary transition-colors hover:text-primary"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {backStepLabel}
              </button>
            )}

            <CheckoutStepper currentStep={currentStep} />

            <div className="mt-6 border-t border-border pt-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
