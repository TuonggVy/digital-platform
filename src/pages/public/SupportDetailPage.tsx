import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { contentService } from '@/services/contentService'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { ROUTES } from '@/constants/routes'
import type { SupportArticle } from '@/types'

export function SupportDetailPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [article, setArticle] = useState<SupportArticle | null>(null)
  const [related, setRelated] = useState<SupportArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setIsLoading(true)
    setFeedback(null)

    contentService.getSupportArticleBySlug(slug).then(async (found) => {
      if (cancelled) return
      if (!found) {
        navigate(ROUTES.SUPPORT)
        return
      }
      setArticle(found)
      if (found.relatedSlugs.length > 0) {
        const all = await contentService.getSupportArticles()
        if (cancelled) return
        setRelated(all.filter((a) => found.relatedSlugs.includes(a.slug)))
      } else {
        setRelated([])
      }
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [slug, navigate])

  if (isLoading || !article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingSpinner label={t('common.loading')} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo
        title={localize(article.title, locale)}
        description={localize(article.summary, locale)}
      />

      <Breadcrumb
        items={[
          { label: t('nav.support'), href: ROUTES.SUPPORT },
          { label: localize(article.title, locale) },
        ]}
      />

      <RevealOnScroll className="mt-6">
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          {localize(article.title, locale)}
        </h1>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
          <Clock className="size-3.5" />
          {article.readTimeMinutes} {t('supportPage.readTime')}
        </p>
      </RevealOnScroll>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-4">
        <RevealOnScroll delay={0.05} className="order-2 lg:order-1 lg:col-span-3">
          <div className="flex flex-col gap-4">
            {article.content.map((paragraph, idx) => (
              <p
                key={idx}
                id={`section-${idx}`}
                className="scroll-mt-24 text-base leading-relaxed text-text-secondary"
              >
                {localize(paragraph, locale)}
              </p>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-6">
            <p className="text-sm font-medium text-text-primary">{t('supportPage.wasHelpful')}</p>
            {feedback ? (
              <p className="mt-3 text-sm text-primary">{t('supportPage.thanksFeedback')}</p>
            ) : (
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setFeedback('yes')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background focus-ring"
                >
                  <ThumbsUp className="size-4" />
                  {t('common.helpfulYes')}
                </button>
                <button
                  onClick={() => setFeedback('no')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background focus-ring"
                >
                  <ThumbsDown className="size-4" />
                  {t('common.helpfulNo')}
                </button>
              </div>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('supportPage.relatedArticles')}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    to={ROUTES.SUPPORT_DETAIL(item.slug)}
                    className="rounded-xl border border-border bg-background p-4 text-sm font-medium text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {localize(item.title, locale)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} direction="left" className="order-1 lg:order-2">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface/40 p-5">
            <p className="text-sm font-semibold text-text-primary">
              {t('supportPage.tableOfContents')}
            </p>
            <ol className="mt-3 flex flex-col gap-2">
              {article.content.map((paragraph, idx) => (
                <li key={idx}>
                  <a
                    href={`#section-${idx}`}
                    className="line-clamp-1 text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {idx + 1}. {localize(paragraph, locale).split(' ').slice(0, 6).join(' ')}…
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
