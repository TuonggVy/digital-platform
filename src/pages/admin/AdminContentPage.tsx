import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Star } from 'lucide-react'
import { contentService } from '@/services/contentService'
import type { Banner, Faq, SupportArticle, Testimonial } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Checkbox } from '@/components/common/Checkbox'
import { Accordion } from '@/components/common/Accordion'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { cn } from '@/utils/cn'

function ContentSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function ContentSectionSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5" aria-busy="true">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}

export function AdminContentPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [banners, setBanners] = useState<Banner[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [articles, setArticles] = useState<SupportArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadContent() {
    setIsLoading(true)
    setError(null)
    Promise.all([
      contentService.getBanners(),
      contentService.getFaqs(),
      contentService.getTestimonials(),
      contentService.getSupportArticles(),
    ])
      .then(([b, f, tst, a]) => {
        setBanners(b)
        setFaqs(f)
        setTestimonials(tst)
        setArticles(a)
      })
      .catch((err) => setError(err instanceof Error ? err.message : t('toast.genericError')))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toggling a banner only updates local component state — the content service has no
  // persistence method for it, so this reflects the pre-existing (non-persisted) behavior.
  function toggleBanner(id: string) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)))
  }

  return (
    <div>
      <Seo title={t('admin.content.title')} />
      <PageHeader title={t('admin.content.title')} description={t('admin.content.description')} />

      {error ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title={t('common.error')}
          description={error}
          action={
            <button
              type="button"
              onClick={loadContent}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
            >
              {t('common.tryAgain')}
            </button>
          }
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-6" aria-busy="true">
          <ContentSectionSkeleton />
          <ContentSectionSkeleton />
          <ContentSectionSkeleton />
          <ContentSectionSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <ContentSection
            title={t('admin.content.banners')}
            description={t('admin.content.bannersDescription')}
          >
            {banners.length === 0 ? (
              <EmptyState title={t('admin.content.noBanners')} />
            ) : (
              <div className="flex flex-col gap-3">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {localize(banner.title, locale)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {localize(banner.subtitle, locale)}
                      </p>
                    </div>
                    <Checkbox
                      label={t('admin.content.bannerStatus')}
                      checked={banner.isActive}
                      onChange={() => toggleBanner(banner.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </ContentSection>

          <ContentSection
            title={t('admin.content.faqs')}
            description={t('admin.content.faqsDescription')}
          >
            {faqs.length === 0 ? (
              <EmptyState title={t('admin.content.noFaqs')} />
            ) : (
              <Accordion
                items={faqs.map((faq) => ({
                  id: faq.id,
                  question: (
                    <span className="flex items-center gap-2">
                      {localize(faq.question, locale)}
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase text-text-secondary">
                        {faq.group}
                      </span>
                    </span>
                  ),
                  answer: localize(faq.answer, locale),
                }))}
              />
            )}
          </ContentSection>

          <ContentSection
            title={t('admin.content.articles')}
            description={t('admin.content.articlesDescription')}
          >
            <DataTable
              data={articles}
              rowKey={(article) => article.id}
              emptyTitle={t('admin.content.noArticles')}
              columns={[
                {
                  key: 'title',
                  header: t('admin.products.name'),
                  render: (article) => localize(article.title, locale),
                },
                {
                  key: 'category',
                  header: t('admin.content.category'),
                  render: (article) => article.category,
                },
                {
                  key: 'readTime',
                  header: t('admin.content.readTime'),
                  render: (article) => `${article.readTimeMinutes} ${t('admin.content.minutes')}`,
                },
              ]}
            />
          </ContentSection>

          <ContentSection
            title={t('admin.content.testimonials')}
            description={t('admin.content.testimonialsDescription')}
          >
            {testimonials.length === 0 ? (
              <EmptyState title={t('admin.content.noTestimonials')} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="rounded-xl border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium text-text-primary">{testimonial.name}</p>
                      <div className="flex items-center gap-0.5" aria-label={`${testimonial.rating}/5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'size-3.5',
                              i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-border',
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mb-2 text-xs text-text-secondary">
                      {localize(testimonial.role, locale)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {localize(testimonial.content, locale)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ContentSection>
        </div>
      )}
    </div>
  )
}
