import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { ROUTES } from '@/constants/routes'

const SOLUTIONS = [
  { key: 'website', icon: 'Globe', href: ROUTES.PRODUCTS_CLOUD },
  { key: 'smallBusiness', icon: 'Building2', href: ROUTES.PRODUCTS_KASPERSKY },
  { key: 'remoteWork', icon: 'Laptop', href: ROUTES.PRODUCTS_CLOUD },
  { key: 'deviceProtection', icon: 'ShieldCheck', href: ROUTES.PRODUCTS_KASPERSKY },
  { key: 'travel', icon: 'Plane', href: ROUTES.PRODUCTS_ESIM },
  { key: 'frequentTravelers', icon: 'Briefcase', href: ROUTES.PRODUCTS_ESIM },
] as const

export function SolutionsPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('solutionsPage.title')} description={t('solutionsPage.subtitle')} />

      <RevealOnScroll className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('solutionsPage.title')}
        </h1>
        <p className="mt-3 text-text-secondary">{t('solutionsPage.subtitle')}</p>
      </RevealOnScroll>

      <StaggerContainer className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((solution) => (
          <StaggerItem key={solution.key}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DynamicIcon name={solution.icon} className="size-6" />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t(`solutionsPage.${solution.key}.title`)}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  {t(`solutionsPage.${solution.key}.desc`)}
                </p>
              </div>
              <Link
                to={solution.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
              >
                {t('solutionsPage.exploreCta')}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}
