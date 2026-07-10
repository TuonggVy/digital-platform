import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, PackageSearch } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/common/SearchBar'
import { Tabs } from '@/components/common/Tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { contentService } from '@/services/contentService'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { ROUTES } from '@/constants/routes'
import type { SupportArticle } from '@/types'

type CategoryFilter = SupportArticle['category'] | 'all'

export function SupportPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const [articles, setArticles] = useState<SupportArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  useEffect(() => {
    setIsLoading(true)
    contentService.getSupportArticles(category === 'all' ? undefined : category).then((data) => {
      setArticles(data)
      setIsLoading(false)
    })
  }, [category])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return articles
    return articles.filter((article) => localize(article.title, locale).toLowerCase().includes(q))
  }, [articles, search, locale])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('supportPage.title')} description={t('supportPage.subtitle')} />

      <RevealOnScroll className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('supportPage.title')}
        </h1>
        <p className="mt-3 text-text-secondary">{t('supportPage.subtitle')}</p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05} className="mx-auto mt-8 max-w-xl">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('supportPage.searchPlaceholder')}
        />
      </RevealOnScroll>

      <div className="mt-6 flex justify-center">
        <Tabs
          value={category}
          onChange={(v) => setCategory(v as CategoryFilter)}
          tabs={[
            { value: 'all', label: t('common.all') },
            { value: 'cloud', label: t('supportPage.categories.cloud') },
            { value: 'kaspersky', label: t('supportPage.categories.kaspersky') },
            { value: 'esim', label: t('supportPage.categories.esim') },
            { value: 'billing', label: t('supportPage.categories.billing') },
            { value: 'account', label: t('supportPage.categories.account') },
          ]}
        />
      </div>

      <div className="mt-10">
        {isLoading ? (
          <LoadingSpinner label={t('common.loading')} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="size-6" />}
            title={t('common.noResults')}
            description={t('supportPage.searchPlaceholder')}
          />
        ) : (
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <StaggerItem key={article.id}>
                <Link
                  to={ROUTES.SUPPORT_DETAIL(article.slug)}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <h2 className="text-base font-semibold text-text-primary">
                    {localize(article.title, locale)}
                  </h2>
                  <p className="flex-1 text-sm text-text-secondary">
                    {localize(article.summary, locale)}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock className="size-3.5" />
                    {article.readTimeMinutes} {t('supportPage.readTime')}
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}
