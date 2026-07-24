import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus, ExternalLink, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Product, ProductCategory } from '@/types'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Pagination } from '@/components/common/Pagination'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import { formatCurrency } from '@/utils/formatters'
import { useUiStore } from '@/stores/uiStore'
import { ROUTES } from '@/constants/routes'

type ProductSort = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

const PAGE_SIZE = 10

export function AdminProductsPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | ''>('')
  const [sort, setSort] = useState<ProductSort>('name_asc')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  function loadProducts() {
    setIsLoading(true)
    setError(null)
    productService
      .getAllForAdmin()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : t('toast.genericError')))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The admin products endpoint has no server-side search/sort/pagination params
  // (getAllForAdmin() takes none) — the full list is fetched once and all three
  // are applied client-side over data that's already real, not fabricated.
  const filtered = useMemo(() => {
    const rows = products.filter((p) => {
      if (category && p.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        const matches = p.name.vi.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
    const sorted = [...rows].sort((a, b) => {
      switch (sort) {
        case 'name_asc':
          return localize(a.name, locale).localeCompare(localize(b.name, locale))
        case 'name_desc':
          return localize(b.name, locale).localeCompare(localize(a.name, locale))
        case 'price_asc':
          return a.startingPrice - b.startingPrice
        case 'price_desc':
          return b.startingPrice - a.startingPrice
        default:
          return 0
      }
    })
    return sorted
  }, [products, search, category, sort, locale])

  useEffect(() => {
    setPage(1)
  }, [search, category, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await productService.deleteProduct(deleteTarget.id)
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
    showToast(t('admin.products.deleted'), 'success')
  }

  return (
    <div>
      <Seo title={t('admin.products.title')} />
      <PageHeader
        title={t('admin.products.title')}
        action={
          <Link to={ROUTES.ADMIN_PRODUCT_NEW}>
            <Button leftIcon={<Plus className="size-4" />}>{t('admin.products.addNew')}</Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('admin.products.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
          options={[
            { value: 'cloud', label: t('nav.megamenu.cloud') },
            { value: 'kaspersky', label: t('nav.megamenu.kaspersky') },
            { value: 'esim', label: t('nav.megamenu.esim') },
          ]}
          placeholder={t('admin.products.category')}
          className="sm:w-56"
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as ProductSort)}
          className="sm:w-56"
          options={[
            { value: 'name_asc', label: t('admin.products.sortNameAsc') },
            { value: 'name_desc', label: t('admin.products.sortNameDesc') },
            { value: 'price_asc', label: t('admin.products.sortPriceAsc') },
            { value: 'price_desc', label: t('admin.products.sortPriceDesc') },
          ]}
        />
      </div>

      {error ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title={t('common.error')}
          description={error}
          action={
            <button
              type="button"
              onClick={loadProducts}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
            >
              {t('common.tryAgain')}
            </button>
          }
        />
      ) : (
        <>
          <DataTable
        data={pageItems}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        emptyTitle={t('common.noResults')}
        columns={[
          {
            key: 'name',
            header: t('admin.products.name'),
            render: (p) => (
              <div className="flex flex-col">
                <span className="font-medium">{localize(p.name, locale)}</span>
                <span className="text-xs text-text-secondary">{p.slug}</span>
              </div>
            ),
          },
          {
            key: 'category',
            header: t('admin.products.category'),
            render: (p) => <Badge variant="primary">{t(`nav.megamenu.${p.category}`)}</Badge>,
          },
          {
            key: 'price',
            header: t('admin.products.price'),
            render: (p) => formatCurrency(p.startingPrice, locale),
          },
          {
            key: 'status',
            header: t('admin.products.status'),
            render: (p) => (
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={p.isActive ? 'success' : 'neutral'}>
                  {p.isActive ? t('admin.products.active') : t('admin.products.inactive')}
                </Badge>
                {p.isFeatured && <Badge variant="accent">{t('admin.products.featured')}</Badge>}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (p) => (
              <div className="flex items-center justify-end gap-1">
                <Link
                  to={ROUTES.PRODUCT_DETAIL(p.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('admin.products.preview')}
                  title={t('admin.products.preview')}
                  className="rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text-primary"
                >
                  <ExternalLink className="size-4" />
                </Link>
                <Link
                  to={ROUTES.ADMIN_PRODUCT_EDIT(p.id)}
                  aria-label={t('common.edit')}
                  title={t('common.edit')}
                  className="rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text-primary"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  aria-label={t('common.delete')}
                  title={t('common.delete')}
                  className="rounded-lg p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ),
          },
        ]}
          />

          {!isLoading && filtered.length > 0 && (
            <div className="mt-5">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={t('common.delete')}
        description={t('admin.products.deleteConfirm')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
