import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Smartphone, ArrowRight } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { Checkbox } from '@/components/common/Checkbox'
import { ProductGrid } from '@/components/product/ProductGrid'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/constants/routes'

export function ProductsEsimPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [days, setDays] = useState('')
  const [hotspotOnly, setHotspotOnly] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    productService
      .getProducts({
        category: 'esim',
        search: search || undefined,
        region: region || undefined,
        days: days ? Number(days) : undefined,
        hotspot: hotspotOnly || undefined,
      })
      .then((p) => {
        setProducts(p)
        setIsLoading(false)
      })
  }, [search, region, days, hotspotOnly])

  return (
    <div>
      <Seo title={t('esimPage.heroTitle')} description={t('esimPage.heroSubtitle')} />

      <section className="relative overflow-hidden bg-grid px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/10 to-transparent" />
        <div className="mx-auto max-w-3xl text-center">
          <RevealOnScroll>
            <span className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              eSIM
            </span>
            <h1 className="text-4xl font-semibold text-text-primary sm:text-5xl">
              {t('esimPage.heroTitle')}
            </h1>
            <p className="mt-4 text-lg text-text-secondary">{t('esimPage.heroSubtitle')}</p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('esimPage.searchCountry')}
          />
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder={t('esimPage.filterRegion')}
            options={[
              { value: 'asia', label: t('products.esim.asia') },
              { value: 'europe', label: t('products.esim.europe') },
              { value: 'north-america', label: t('products.esim.namerica') },
              { value: 'global', label: t('products.esim.global') },
            ]}
          />
          <Select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder={t('esimPage.filterDays')}
            options={[
              { value: '5', label: '5' },
              { value: '7', label: '7' },
              { value: '10', label: '10' },
              { value: '15', label: '15' },
              { value: '30', label: '30' },
            ]}
          />
          <div className="flex items-center">
            <Checkbox
              label={t('esimPage.filterHotspot')}
              checked={hotspotOnly}
              onChange={(e) => setHotspotOnly(e.target.checked)}
            />
          </div>
        </div>

        <div className="mb-10 flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface/40 p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Smartphone className="size-6" />
            </span>
            <div>
              <p className="font-semibold text-text-primary">{t('esimPage.checkDeviceTitle')}</p>
              <p className="text-sm text-text-secondary">{t('esimPage.checkDeviceDesc')}</p>
            </div>
          </div>
          <Link to={ROUTES.ESIM_DEVICES}>
            <Button variant="outline" rightIcon={<ArrowRight className="size-4" />}>
              {t('esimPage.checkDeviceCta')}
            </Button>
          </Link>
        </div>

        <ProductGrid products={products} isLoading={isLoading} />
      </section>
    </div>
  )
}
