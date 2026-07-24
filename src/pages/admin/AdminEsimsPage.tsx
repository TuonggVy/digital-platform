import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AlertCircle, Copy, Plus } from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import type { EsimStockItem, EsimStockStatus } from '@/data/mocks/esimInventory'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { AdminToolbar } from '@/components/admin/AdminToolbar'
import { AdminMobileList } from '@/components/admin/AdminMobileList'
import { SearchBar } from '@/components/common/SearchBar'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useUiStore } from '@/stores/uiStore'

const ESIM_PRODUCTS = [
  { id: 'esim-japan-5gb', name: 'eSIM Nhật Bản 5GB' },
  { id: 'esim-korea-unlimited', name: 'eSIM Hàn Quốc Unlimited' },
  { id: 'esim-europe', name: 'eSIM Châu Âu' },
  { id: 'esim-global', name: 'eSIM Toàn cầu' },
  { id: 'esim-usa-unlimited', name: 'eSIM Hoa Kỳ Unlimited' },
]

function productName(productId: string): string {
  return ESIM_PRODUCTS.find((p) => p.id === productId)?.name ?? productId
}

const STATUS_OPTIONS: EsimStockStatus[] = ['AVAILABLE', 'ASSIGNED', 'USED']

const STATUS_VARIANT: Record<EsimStockStatus, 'success' | 'primary' | 'neutral'> = {
  AVAILABLE: 'success',
  ASSIGNED: 'primary',
  USED: 'neutral',
}

type EsimSort = 'days_asc' | 'days_desc'
const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

interface EsimFormValues {
  code: string
  productId: string
  country: string
  dataAmount: string
  days: number
}

function defaultValues(): EsimFormValues {
  return { code: '', productId: ESIM_PRODUCTS[0].id, country: '', dataAmount: '', days: 7 }
}

export function AdminEsimsPage() {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)

  const [items, setItems] = useState<EsimStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [status, setStatus] = useState<EsimStockStatus | ''>('')
  const [productFilter, setProductFilter] = useState('')
  const [sort, setSort] = useState<EsimSort>('days_asc')
  const [page, setPage] = useState(1)

  const { register, handleSubmit, reset } = useForm<EsimFormValues>({
    defaultValues: defaultValues(),
  })

  function loadItems() {
    setIsLoading(true)
    setError(null)
    inventoryService
      .getEsimStock()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : t('toast.genericError')))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, status, productFilter, sort])

  const filtered = useMemo(() => {
    const rows = items.filter((i) => {
      if (status && i.status !== status) return false
      if (productFilter && i.productId !== productFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const matches = i.code.toLowerCase().includes(q) || i.country.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
    return [...rows].sort((a, b) => (sort === 'days_asc' ? a.days - b.days : b.days - a.days))
  }, [items, search, status, productFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = search !== '' || status !== '' || productFilter !== ''
  function clearFilters() {
    setSearchInput('')
    setStatus('')
    setProductFilter('')
  }

  const emptyTitle = items.length === 0 ? t('admin.esims.noEsims') : t('common.noResults')

  function openModal() {
    reset(defaultValues())
    setSubmitError(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSubmitting) return
    setIsModalOpen(false)
  }

  async function onSubmit(values: EsimFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const created = await inventoryService.addEsimStock({
        code: values.code,
        productId: values.productId,
        country: values.country,
        dataAmount: values.dataAmount,
        days: Number(values.days),
      })
      setItems((prev) => [created, ...prev])
      setIsModalOpen(false)
      showToast(t('admin.esims.added'), 'success')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      showToast(t('common.copied'), 'success')
    } catch {
      showToast(t('toast.genericError'), 'error')
    }
  }

  return (
    <div>
      <Seo title={t('admin.esims.title')} />
      <PageHeader
        title={t('admin.esims.title')}
        description={t('admin.esims.description')}
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={openModal}>
            {t('admin.esims.addNew')}
          </Button>
        }
      />

      <AdminToolbar
        resultText={t('admin.esims.resultsCount', { count: filtered.length })}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        clearLabel={t('common.clearFilter')}
      >
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.esims.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as EsimStockStatus | '')}
          placeholder={t('common.all')}
          className="sm:w-48"
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: t(`admin.esims.statuses.${s}`) }))}
        />
        <Select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          placeholder={t('admin.esims.product')}
          className="sm:w-56"
          options={ESIM_PRODUCTS.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as EsimSort)}
          className="sm:w-48"
          options={[
            { value: 'days_asc', label: t('admin.esims.sortDaysAsc') },
            { value: 'days_desc', label: t('admin.esims.sortDaysDesc') },
          ]}
        />
      </AdminToolbar>

      {error ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title={t('common.error')}
          description={error}
          action={
            <button
              type="button"
              onClick={loadItems}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
            >
              {t('common.tryAgain')}
            </button>
          }
        />
      ) : (
        <>
          <div className="hidden sm:block">
            <DataTable
              data={pageItems}
              isLoading={isLoading}
              rowKey={(i) => i.id}
              emptyTitle={emptyTitle}
              columns={[
                {
                  key: 'code',
                  header: t('admin.esims.code'),
                  render: (i) => (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{i.code}</span>
                      <button
                        type="button"
                        onClick={() => copyCode(i.code)}
                        aria-label={`${t('common.copy')} — ${i.code}`}
                        title={t('common.copy')}
                        className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary focus-ring"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  ),
                },
                { key: 'product', header: t('admin.esims.product'), render: (i) => productName(i.productId) },
                { key: 'country', header: t('admin.esims.country'), render: (i) => i.country },
                { key: 'dataAmount', header: t('admin.esims.dataAmount'), render: (i) => i.dataAmount },
                { key: 'days', header: t('admin.esims.days'), render: (i) => <span className="font-data">{i.days}</span> },
                {
                  key: 'status',
                  header: t('admin.esims.status'),
                  render: (i) => (
                    <Badge variant={STATUS_VARIANT[i.status]}>{t(`admin.esims.statuses.${i.status}`)}</Badge>
                  ),
                },
                {
                  key: 'assignedOrder',
                  header: t('admin.esims.assignedOrder'),
                  render: (i) => i.assignedOrderCode ?? t('admin.licenses.unassigned'),
                },
              ]}
            />
          </div>

          <div className="sm:hidden">
            <AdminMobileList
              data={pageItems}
              isLoading={isLoading}
              rowKey={(i) => i.id}
              emptyTitle={emptyTitle}
              renderCard={(i) => (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{i.code}</span>
                      <button
                        type="button"
                        onClick={() => copyCode(i.code)}
                        aria-label={`${t('common.copy')} — ${i.code}`}
                        className="rounded-lg p-1 text-text-secondary hover:bg-surface focus-ring"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                    <Badge variant={STATUS_VARIANT[i.status]}>{t(`admin.esims.statuses.${i.status}`)}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {productName(i.productId)} &middot; {i.country}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {i.dataAmount} &middot; {i.days} {t('admin.services.daysUnit')} &middot;{' '}
                    {i.assignedOrderCode ?? t('admin.licenses.unassigned')}
                  </p>
                </div>
              )}
            />
          </div>

          {!isLoading && filtered.length > 0 && (
            <div className="mt-5">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={t('admin.esims.modalTitle')}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Input label={t('admin.esims.code')} {...register('code', { required: true })} />
            <Select
              label={t('admin.esims.product')}
              {...register('productId', { required: true })}
              options={ESIM_PRODUCTS.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label={t('admin.esims.country')} {...register('country', { required: true })} />
            <Input
              label={t('admin.esims.dataAmount')}
              {...register('dataAmount', { required: true })}
            />
            <Input
              type="number"
              step="1"
              label={t('admin.esims.days')}
              {...register('days', { required: true, valueAsNumber: true })}
            />
          </div>
          {submitError && (
            <p role="alert" className="text-sm text-red-500">
              {submitError}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
              {t('admin.esims.cancel')}
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {t('admin.esims.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
