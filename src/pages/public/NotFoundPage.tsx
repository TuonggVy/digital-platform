import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Search } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-grid px-4 py-20 sm:px-6 lg:px-8">
      <Seo title={t('notFoundPage.title')} description={t('notFoundPage.desc')} />

      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-20 blur-3xl" />

      <RevealOnScroll className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-8xl font-bold tracking-tight text-primary sm:text-9xl">
          {t('notFoundPage.title')}
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-text-primary sm:text-3xl">
          {t('notFoundPage.subtitle')}
        </h1>
        <p className="mt-3 text-text-secondary">{t('notFoundPage.desc')}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={ROUTES.HOME}>
            <Button size="lg" leftIcon={<Home className="size-4" />}>
              {t('notFoundPage.goHome')}
            </Button>
          </Link>
          <Link to={ROUTES.PRODUCTS}>
            <Button size="lg" variant="outline" leftIcon={<Search className="size-4" />}>
              {t('notFoundPage.findProducts')}
            </Button>
          </Link>
        </div>
      </RevealOnScroll>
    </div>
  )
}
