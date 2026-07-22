import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Server, Boxes, Database, ShieldCheck, Network } from 'lucide-react'
import { productService } from '@/services/productService'
import { contentService } from '@/services/contentService'
import type { Faq, Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCategoryHero } from '@/components/product/ProductCategoryHero'
import { ComparisonTable } from '@/components/common/ComparisonTable'
import { Accordion } from '@/components/common/Accordion'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { formatCurrency } from '@/utils/formatters'

const USE_CASES = [
  { icon: Server, key: 'useCase1' },
  { icon: Boxes, key: 'useCase2' },
  { icon: Database, key: 'useCase3' },
] as const

const WHY_CLOUD = [
  { icon: ShieldCheck, titleVi: 'Bảo mật nhiều lớp', titleEn: 'Multi-layer security' },
  { icon: Network, titleVi: 'Hạ tầng mạng ổn định', titleEn: 'Stable network infrastructure' },
  { icon: Server, titleVi: 'Hiệu suất cao ổn định', titleEn: 'Consistently high performance' },
]

export function ProductsCloudPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productService.getProducts({ category: 'cloud' }),
      contentService.getFaqs('cloud'),
    ]).then(([p, f]) => {
      setProducts(p)
      setFaqs(f)
      setIsLoading(false)
    })
  }, [])

  const cloudServer = products.find((p) => p.subCategory === 'cloud-server')
  const compareRows = cloudServer
    ? [
        {
          label: t('productDetail.cpu'),
          values: cloudServer.packages.map((p) => p.cloud?.cpu ?? '-'),
        },
        {
          label: t('productDetail.ram'),
          values: cloudServer.packages.map((p) => p.cloud?.ram ?? '-'),
        },
        {
          label: t('productDetail.ssd'),
          values: cloudServer.packages.map((p) => p.cloud?.ssd ?? '-'),
        },
        { label: 'Bandwidth', values: cloudServer.packages.map((p) => p.cloud?.bandwidth ?? '-') },
        {
          label: t('productDetail.region'),
          values: cloudServer.packages.map((p) => p.cloud?.regions.join(', ') ?? '-'),
        },
        {
          label: t('common.startingFrom'),
          values: cloudServer.packages.map((p) => formatCurrency(p.price, locale)),
        },
      ]
    : []

  return (
    <div>
      <Seo title={t('cloudPage.heroTitle')} description={t('cloudPage.heroSubtitle')} />

      <ProductCategoryHero
        eyebrow="CLOUD"
        title={t('cloudPage.heroTitle')}
        subtitle={t('cloudPage.heroSubtitle')}
        visual="cloud"
        breadcrumbItems={[{ label: t('nav.megamenu.cloud') }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ProductGrid products={products} isLoading={isLoading} />
      </section>

      {compareRows.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <SectionHeading title={t('cloudPage.compareTitle')} className="mb-8" />
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <ComparisonTable
              columns={cloudServer!.packages.map((p) => localize(p.name, locale))}
              rows={compareRows}
              highlightColumnIndex={cloudServer!.packages.findIndex((p) => p.isPopular)}
            />
          </RevealOnScroll>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionHeading title={t('cloudPage.useCasesTitle')} className="mb-10" />
        </RevealOnScroll>
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {USE_CASES.map((uc) => (
            <StaggerItem key={uc.key}>
              <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-border p-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <uc.icon className="size-5" />
                </span>
                <p className="text-sm font-medium text-text-primary">{t(`cloudPage.${uc.key}`)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="bg-surface/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <SectionHeading title={t('cloudPage.whyTitle')} className="mb-10" />
          </RevealOnScroll>
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {WHY_CLOUD.map((item) => (
              <StaggerItem key={item.titleEn}>
                <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-border/70 bg-background p-6 text-center">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-text-primary">
                    {locale === 'vi' ? item.titleVi : item.titleEn}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <SectionHeading title={t('cloudPage.faqTitle')} className="mb-8" />
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <Accordion
              items={faqs.map((f) => ({
                id: f.id,
                question: localize(f.question, locale),
                answer: localize(f.answer, locale),
              }))}
            />
          </RevealOnScroll>
        </section>
      )}
    </div>
  )
}
