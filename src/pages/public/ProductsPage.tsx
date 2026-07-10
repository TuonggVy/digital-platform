import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Product, ProductCategory } from '@/types'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Pagination } from '@/components/common/Pagination'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 9

export function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  const search = searchParams.get('q') ?? ''
  const category = (searchParams.get('category') as ProductCategory | '') ?? ''
  const sort = (searchParams.get('sort') as 'featured' | 'price_asc' | 'price_desc') || 'featured'

  useEffect(() => {
    setIsLoading(true)
    productService
      .getProducts({ search, category: category || undefined, sort })
      .then(setProducts)
      .finally(() => setIsLoading(false))
  }, [search, category, sort])

  useEffect(() => setPage(1), [search, category, sort])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const paginated = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [products, page],
  )
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('productsPage.title')} description={t('productsPage.subtitle')} />

      <RevealOnScroll>
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('productsPage.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary">{t('productsPage.subtitle')}</p>
      </RevealOnScroll>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={(v) => updateParam('q', v)}
          placeholder={t('productsPage.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          options={[
            { value: 'cloud', label: t('nav.megamenu.cloud') },
            { value: 'kaspersky', label: t('nav.megamenu.kaspersky') },
            { value: 'esim', label: t('nav.megamenu.esim') },
          ]}
          placeholder={t('productsPage.category')}
          className="sm:w-48"
        />
        <Select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          options={[
            { value: 'featured', label: t('productsPage.sort.featured') },
            { value: 'price_asc', label: t('productsPage.sort.priceAsc') },
            { value: 'price_desc', label: t('productsPage.sort.priceDesc') },
          ]}
          className="sm:w-48"
        />
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => setView('grid')}
            aria-label={t('common.gridView')}
            className={cn(
              'rounded-md p-1.5',
              view === 'grid' ? 'bg-primary text-white' : 'text-text-secondary',
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView('list')}
            aria-label={t('common.listView')}
            className={cn(
              'rounded-md p-1.5',
              view === 'list' ? 'bg-primary text-white' : 'text-text-secondary',
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {!isLoading && (
        <p className="mt-4 text-sm text-text-secondary">
          {t('productsPage.resultsCount', { count: products.length })}
        </p>
      )}

      <div className="mt-6">
        <ProductGrid products={paginated} isLoading={isLoading} view={view} />
      </div>

      {!isLoading && products.length > 0 && (
        <div className="mt-10">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
