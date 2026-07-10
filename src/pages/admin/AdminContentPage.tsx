import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { contentService } from '@/services/contentService'
import type { Banner, Faq, SupportArticle, Testimonial } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { Checkbox } from '@/components/common/Checkbox'
import { Accordion } from '@/components/common/Accordion'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { cn } from '@/utils/cn'

export function AdminContentPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [banners, setBanners] = useState<Banner[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [articles, setArticles] = useState<SupportArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
      .finally(() => setIsLoading(false))
  }, [])

  function toggleBanner(id: string) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)))
  }

  if (isLoading) {
    return (
      <div>
        <Seo title={t('admin.content.title')} />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <Seo title={t('admin.content.title')} />
      <PageHeader title={t('admin.content.title')} />

      <div className="flex flex-col gap-8">
        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {t('admin.content.banners')}
          </h2>
          <div className="flex flex-col gap-3">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-text-primary">{localize(banner.title, locale)}</p>
                  <p className="text-sm text-text-secondary">{localize(banner.subtitle, locale)}</p>
                </div>
                <Checkbox
                  label={t('admin.content.bannerStatus')}
                  checked={banner.isActive}
                  onChange={() => toggleBanner(banner.id)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {t('admin.content.faqs')}
          </h2>
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
        </section>

        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {t('admin.content.articles')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  <th className="px-3 py-2">{t('admin.products.name')}</th>
                  <th className="px-3 py-2">{t('admin.content.category')}</th>
                  <th className="px-3 py-2">{t('admin.content.readTime')}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-text-primary">
                      {localize(article.title, locale)}
                    </td>
                    <td className="px-3 py-2 text-text-secondary">{article.category}</td>
                    <td className="px-3 py-2 text-text-secondary">
                      {article.readTimeMinutes} {t('admin.content.minutes')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {t('admin.content.testimonials')}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-text-primary">{testimonial.name}</p>
                  <div className="flex items-center gap-0.5">
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
        </section>
      </div>
    </div>
  )
}
