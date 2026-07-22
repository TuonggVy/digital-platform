import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { productService } from '@/services/productService'
import type { Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCategoryHero } from '@/components/product/ProductCategoryHero'
import { ComparisonTable } from '@/components/common/ComparisonTable'
import { Select } from '@/components/common/Select'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'

export function ProductsKasperskyPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState('')

  useEffect(() => {
    setIsLoading(true)
    productService
      .getProducts({ category: 'kaspersky', userType: userType || undefined })
      .then((p) => {
        setProducts(p)
        setIsLoading(false)
      })
  }, [userType])

  const compareRows = [
    {
      label: t('productDetail.devices'),
      values: products.map((p) =>
        String(p.packages[p.packages.length - 1]?.kaspersky?.devices ?? '-'),
      ),
    },
    {
      label: t('productDetail.duration'),
      values: products.map((p) => p.packages[0]?.kaspersky?.duration ?? '-'),
    },
    { label: t('home.kasperskySection.f1'), values: products.map(() => true) },
    { label: 'VPN', values: products.map((p) => p.subCategory !== 'standard') },
    { label: t('home.kasperskySection.f3'), values: products.map(() => true) },
    { label: 'Password Manager', values: products.map((p) => p.subCategory !== 'standard') },
  ]

  return (
    <div>
      <Seo title={t('kasperskyPage.heroTitle')} description={t('kasperskyPage.heroSubtitle')} />

      <ProductCategoryHero
        eyebrow="KASPERSKY"
        title={t('kasperskyPage.heroTitle')}
        subtitle={t('kasperskyPage.heroSubtitle')}
        visual="security"
        breadcrumbItems={[{ label: t('nav.megamenu.kaspersky') }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <Select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            options={[
              { value: 'personal', label: t('kasperskyPage.personal') },
              { value: 'family', label: t('kasperskyPage.family') },
              { value: 'business', label: t('kasperskyPage.business') },
            ]}
            placeholder={t('kasperskyPage.filterUserType')}
            className="w-64"
          />
        </div>
        <ProductGrid products={products} isLoading={isLoading} />
      </section>

      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <SectionHeading title={t('kasperskyPage.compareTitle')} className="mb-8" />
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <ComparisonTable
              columns={products.map((p) => localize(p.name, locale))}
              rows={compareRows}
              highlightColumnIndex={1}
            />
          </RevealOnScroll>
        </section>
      )}
    </div>
  )
}
