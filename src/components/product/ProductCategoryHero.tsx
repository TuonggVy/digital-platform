import { Breadcrumb, type BreadcrumbItem } from '@/components/common/Breadcrumb'
import { CoverageMap } from '@/components/home/CoverageMap'
import { CloudProductVisual } from '@/components/visuals/product/CloudProductVisual'
import { EsimRouteMapVisual } from '@/components/visuals/product/EsimRouteMapVisual'
import { SecurityRadarVisual } from '@/components/visuals/product/SecurityRadarVisual'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { cn } from '@/utils/cn'

export type ProductCategoryVisual = 'cloud' | 'security' | 'esim' | 'platform'

interface ProductCategoryHeroProps {
  eyebrow: string
  title: string
  subtitle: string
  /**
   * Which decorative visual to show. Cloud/security/esim render that
   * category's own illustration; 'platform' renders the general,
   * all-category CoverageMap overview — required (no default) so a page that
   * represents every category, like Pricing, can never silently inherit one
   * category's illustration.
   */
  visual: ProductCategoryVisual
  breadcrumbItems: BreadcrumbItem[]
  className?: string
}

function CategoryVisual({ visual }: { visual: ProductCategoryVisual }) {
  switch (visual) {
    case 'cloud':
      return <CloudProductVisual variant="compact" className="h-full w-full" />
    case 'esim':
      return <EsimRouteMapVisual variant="compact" className="h-full w-full" />
    case 'security':
      return <SecurityRadarVisual variant="compact" className="h-full w-full" />
    case 'platform':
      return <CoverageMap variant="hero" tone="dark" showLabels={false} className="h-full w-full" />
    default: {
      const exhaustiveCheck: never = visual
      throw new Error(`Unhandled ProductCategoryHero visual: ${String(exhaustiveCheck)}`)
    }
  }
}

/**
 * Compact category header shared by the Cloud/Kaspersky/eSIM listing pages and
 * the Pricing page — a small, quiet cousin of the Homepage Hero. Cloud/eSIM/
 * security each get their own illustration (CloudProductVisual/EsimRouteMapVisual/
 * SecurityRadarVisual); 'platform' keeps the general CoverageMap overview for
 * contexts, like Pricing, that represent all three categories at once.
 */
export function ProductCategoryHero({
  eyebrow,
  title,
  subtitle,
  visual,
  breadcrumbItems,
  className,
}: ProductCategoryHeroProps) {
  return (
    <section className={cn('relative overflow-hidden bg-home-ink font-plex', className)}>
      <div className="bg-grid-home-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0,102,179,0.14))',
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[420px] opacity-50 [mask-image:linear-gradient(to_right,transparent,black_30%)] lg:block"
        aria-hidden
      >
        <CategoryVisual visual={visual} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <RevealOnScroll>
          <Breadcrumb items={breadcrumbItems} tone="dark" />
        </RevealOnScroll>

        <RevealOnScroll delay={0.06} className="mt-6 max-w-xl">
          <span className="inline-flex items-center gap-2 font-data text-xs uppercase tracking-[0.16em] text-home-wire">
            <span className="size-1.5 rounded-full bg-home-wire" />
            // {eyebrow}
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-white/60">{subtitle}</p>
        </RevealOnScroll>
      </div>
    </section>
  )
}
