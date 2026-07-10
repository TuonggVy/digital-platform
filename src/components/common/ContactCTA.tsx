import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from './Button'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

interface ContactCTAProps {
  title: string
  primaryLabel: string
  secondaryLabel: string
  primaryHref?: string
  /** Render without its own rounded card/background — for use inside a section that already provides a full-bleed background. */
  bare?: boolean
  /** Add a soft glow behind the primary button. */
  glow?: boolean
}

export function ContactCTA({
  title,
  primaryLabel,
  secondaryLabel,
  primaryHref = ROUTES.PRODUCTS,
  bare = false,
  glow = false,
}: ContactCTAProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden text-center',
        !bare && 'rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent px-8 py-16 sm:px-16',
      )}
    >
      {!bare && <div className="absolute inset-0 bg-grid opacity-10" />}
      <div className="relative flex flex-col items-center gap-6">
        <h2 className="max-w-2xl text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={primaryHref}>
            <Button
              size="lg"
              className={cn(
                'bg-white !text-black hover:bg-white/90',
                glow && 'shadow-[0_0_50px_-5px_rgba(255,255,255,0.55)] hover:shadow-[0_0_70px_-5px_rgba(255,255,255,0.7)]',
              )}
              rightIcon={<ArrowRight className="size-4" />}
            >
              {primaryLabel}
            </Button>
          </Link>
          <Link to={ROUTES.CONTACT}>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
            >
              {secondaryLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
