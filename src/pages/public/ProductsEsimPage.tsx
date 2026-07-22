import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Smartphone, ArrowRight, SlidersHorizontal, X } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Product } from '@/types'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { Checkbox } from '@/components/common/Checkbox'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCategoryHero } from '@/components/product/ProductCategoryHero'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/constants/routes'

const REGION_OPTIONS = [
  { value: 'asia', labelKey: 'products.esim.asia' },
  { value: 'europe', labelKey: 'products.esim.europe' },
  { value: 'north-america', labelKey: 'products.esim.namerica' },
  { value: 'global', labelKey: 'products.esim.global' },
] as const

const DAYS_OPTIONS = ['5', '7', '10', '15', '30']

export function ProductsEsimPage() {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [days, setDays] = useState('')
  const [hotspotOnly, setHotspotOnly] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

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

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (search) chips.push({ key: 'search', label: `"${search}"`, onRemove: () => setSearch('') })
    if (region) {
      const opt = REGION_OPTIONS.find((r) => r.value === region)
      if (opt) chips.push({ key: 'region', label: t(opt.labelKey), onRemove: () => setRegion('') })
    }
    if (days) {
      chips.push({
        key: 'days',
        label: `${days} ${t('productDetail.days').toLowerCase()}`,
        onRemove: () => setDays(''),
      })
    }
    if (hotspotOnly) {
      chips.push({
        key: 'hotspot',
        label: t('esimPage.filterHotspot'),
        onRemove: () => setHotspotOnly(false),
      })
    }
    return chips
  }, [search, region, days, hotspotOnly, t])

  function resetFilters() {
    setSearch('')
    setRegion('')
    setDays('')
    setHotspotOnly(false)
  }

  const filterControls = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <SearchBar value={search} onChange={setSearch} placeholder={t('esimPage.searchCountry')} />
      <Select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        placeholder={t('esimPage.filterRegion')}
        options={REGION_OPTIONS.map((opt) => ({ value: opt.value, label: t(opt.labelKey) }))}
      />
      <Select
        value={days}
        onChange={(e) => setDays(e.target.value)}
        placeholder={t('esimPage.filterDays')}
        options={DAYS_OPTIONS.map((d) => ({ value: d, label: d }))}
      />
      <div className="flex items-center">
        <Checkbox
          label={t('esimPage.filterHotspot')}
          checked={hotspotOnly}
          onChange={(e) => setHotspotOnly(e.target.checked)}
        />
      </div>
    </div>
  )

  return (
    <div>
      <Seo title={t('esimPage.heroTitle')} description={t('esimPage.heroSubtitle')} />

      <ProductCategoryHero
        eyebrow="ESIM"
        title={t('esimPage.heroTitle')}
        subtitle={t('esimPage.heroSubtitle')}
        visual="esim"
        breadcrumbItems={[{ label: t('nav.megamenu.esim') }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-xl border border-border bg-surface/40 p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setIsFilterOpen((v) => !v)}
            aria-expanded={isFilterOpen}
            className="flex w-full items-center justify-between gap-2 text-sm font-medium text-text-primary sm:hidden"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              {t('common.filter')}
              {activeFilters.length > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {activeFilters.length}
                </span>
              )}
            </span>
          </button>

          <div className="hidden sm:block">{filterControls}</div>

          <AnimatePresence initial={false}>
            {isFilterOpen && (
              <motion.div
                className="overflow-hidden sm:hidden"
                initial={reduced ? undefined : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="pt-4">{filterControls}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
              {activeFilters.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15 focus-ring"
                >
                  {chip.label}
                  <X className="size-3.5" />
                </button>
              ))}
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-text-secondary underline-offset-2 hover:text-text-primary hover:underline focus-ring rounded"
              >
                {t('common.clearFilter')}
              </button>
            </div>
          )}
        </div>

        <RevealOnScroll className="mb-10 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface/40 p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
        </RevealOnScroll>

        <ProductGrid products={products} isLoading={isLoading} />
      </section>
    </div>
  )
}
