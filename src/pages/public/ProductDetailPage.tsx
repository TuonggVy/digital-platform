import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, PhoneCall } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { FeatureList } from '@/components/common/FeatureList'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Accordion } from '@/components/common/Accordion'
import { ProductCard } from '@/components/product/ProductCard'
import { PackageSelector } from '@/components/product/PackageSelector'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

const categoryPath: Record<string, string> = {
  cloud: ROUTES.PRODUCTS_CLOUD,
  kaspersky: ROUTES.PRODUCTS_KASPERSKY,
  esim: ROUTES.PRODUCTS_ESIM,
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    setNotFound(false)
    productService.getProductBySlug(slug).then(async (p) => {
      if (!p) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      setProduct(p)
      const relatedProducts = await productService.getRelatedProducts(p)
      setRelated(relatedProducts)
      setIsLoading(false)
      window.scrollTo({ top: 0 })
    })
  }, [slug])

  if (isLoading) return <LoadingSpinner className="py-32" label={t('common.loading')} />

  if (notFound || !product) {
    navigate(ROUTES.HOME)
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title={localize(product.name, locale)}
        description={localize(product.shortDescription, locale)}
      />

      <Breadcrumb
        items={[
          { label: t(`nav.megamenu.${product.category}`), href: categoryPath[product.category] },
          { label: localize(product.name, locale) },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <RevealOnScroll>
          <div className="flex items-center gap-3">
            <Badge variant="primary">{t(`nav.megamenu.${product.category}`)}</Badge>
            {product.badge && <Badge variant="accent">{localize(product.badge, locale)}</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
            {localize(product.name, locale)}
          </h1>
          <p className="mt-3 text-lg text-text-secondary">
            {localize(product.shortDescription, locale)}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-text-secondary">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {product.rating} ({product.reviewCount} {t('common.reviews')})
          </div>
          <p className="mt-5 text-sm text-text-secondary">{t('productDetail.startingFrom')}</p>
          <p className="text-3xl font-bold text-text-primary">
            {formatCurrency(product.startingPrice, locale)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#select-package">
              <Button size="lg">{t('common.buyNow')}</Button>
            </a>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" variant="outline" leftIcon={<PhoneCall className="size-4" />}>
                {t('common.contactSales')}
              </Button>
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15} direction="left">
          <div className="relative flex aspect-square items-center justify-center rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
            <div className="absolute size-40 rounded-full bg-primary/20 blur-3xl" />
            <DynamicIcon name={product.icon} className="relative size-28 text-primary" />
          </div>
        </RevealOnScroll>
      </div>

      <div id="select-package" className="mt-16 scroll-mt-24">
        <RevealOnScroll>
          <PackageSelector product={product} />
        </RevealOnScroll>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <RevealOnScroll>
          <SectionHeading title={t('productDetail.overview')} align="left" className="mb-4" />
          <p className="text-sm leading-relaxed text-text-secondary">
            {localize(product.description, locale)}
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <SectionHeading title={t('productDetail.benefits')} align="left" className="mb-4" />
          <FeatureList items={product.benefits.map((b) => localize(b, locale))} />
        </RevealOnScroll>

        <RevealOnScroll>
          <SectionHeading title={t('productDetail.features')} align="left" className="mb-4" />
          <FeatureList items={product.features.map((f) => localize(f, locale))} />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <SectionHeading title={t('productDetail.suitableFor')} align="left" className="mb-4" />
          <FeatureList items={product.suitableFor.map((s) => localize(s, locale))} />
        </RevealOnScroll>
      </div>

      <div className="mt-16">
        <RevealOnScroll>
          <SectionHeading title={t('productDetail.howItWorks')} align="left" className="mb-8" />
        </RevealOnScroll>
        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {product.howItWorks.map((step, idx) => (
            <StaggerItem key={idx}>
              <div className="h-full rounded-2xl border border-border p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {idx + 1}
                </span>
                <p className="mt-3 text-sm text-text-secondary">{localize(step, locale)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {product.faqs.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl">
          <RevealOnScroll>
            <SectionHeading title={t('productDetail.faq')} className="mb-8" />
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <Accordion
              items={product.faqs.map((f, idx) => ({
                id: String(idx),
                question: localize(f.question, locale),
                answer: localize(f.answer, locale),
              }))}
            />
          </RevealOnScroll>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <RevealOnScroll>
            <SectionHeading
              title={t('productDetail.relatedProducts')}
              align="left"
              className="mb-8"
            />
          </RevealOnScroll>
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}
    </div>
  )
}
