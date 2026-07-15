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
  /** Text/button treatment — 'dark' assumes a dark or saturated background (default), 'light' assumes a pale background. */
  tone?: 'dark' | 'light'
  /** Add a Linear/Vercel-style light sweep to the primary button on hover. */
  shine?: boolean
}

export function ContactCTA({
  title,
  primaryLabel,
  secondaryLabel,
  primaryHref = ROUTES.PRODUCTS,
  bare = false,
  glow = false,
  tone = 'dark',
  shine = false,
}: ContactCTAProps) {
  const isLight = tone === 'light'

  return (
    <div
      className={cn(
        'relative overflow-hidden text-center',
        !bare && 'rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent px-8 py-16 sm:px-16',
      )}
    >
      {!bare && <div className="absolute inset-0 bg-grid opacity-10" />}
      <div className="relative flex flex-col items-center gap-6">
        <h2
          className={cn(
            'max-w-2xl text-3xl font-semibold sm:text-4xl',
            isLight ? 'text-text-primary' : 'text-white',
          )}
        >
          {title}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={primaryHref}>
            <Button
              size="lg"
              shine={shine}
              className={cn(
                !isLight && 'bg-white !text-black hover:bg-white/90',
                !shine &&
                  glow &&
                  (isLight
                    ? 'shadow-[0_0_40px_-8px_rgba(37,99,235,0.35)] hover:shadow-[0_0_55px_-8px_rgba(37,99,235,0.45)]'
                    : 'shadow-[0_0_50px_-5px_rgba(255,255,255,0.55)] hover:shadow-[0_0_70px_-5px_rgba(255,255,255,0.7)]'),
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
              className={cn(!isLight && 'border-white/40 text-white hover:bg-white/10')}
            >
              {secondaryLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
