import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AlertCircle, Copy, Plus } from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import type { LicenseStatus, LicenseStockItem } from '@/data/mocks/licenses'
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
import { useLocale } from '@/hooks/useLocale'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatDate, maskLicenseKey } from '@/utils/formatters'
import { useUiStore } from '@/stores/uiStore'

const KASPERSKY_PRODUCTS = [
  { id: 'kaspersky-standard', name: 'Kaspersky Standard' },
  { id: 'kaspersky-plus', name: 'Kaspersky Plus' },
  { id: 'kaspersky-premium', name: 'Kaspersky Premium' },
  { id: 'kaspersky-small-office-security', name: 'Kaspersky Small Office Security' },
]

const STATUS_OPTIONS: LicenseStatus[] = ['AVAILABLE', 'ASSIGNED', 'EXPIRED']

const STATUS_VARIANT: Record<LicenseStatus, 'success' | 'primary' | 'danger'> = {
  AVAILABLE: 'success',
  ASSIGNED: 'primary',
  EXPIRED: 'danger',
}

type LicenseSort = 'expiry_asc' | 'expiry_desc'
const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

interface LicenseFormValues {
  key: string
  productId: string
  duration: string
  expiryDate: string
}

function defaultValues(): LicenseFormValues {
  return { key: '', productId: KASPERSKY_PRODUCTS[0].id, duration: '1 năm', expiryDate: '' }
}

export function AdminLicensesPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)

  const [licenses, setLicenses] = useState<LicenseStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [status, setStatus] = useState<LicenseStatus | ''>('')
  const [sort, setSort] = useState<LicenseSort>('expiry_asc')
  const [page, setPage] = useState(1)

  const { register, handleSubmit, reset } = useForm<LicenseFormValues>({
    defaultValues: defaultValues(),
  })

  function loadLicenses() {
    setIsLoading(true)
    setError(null)
    inventoryService
      .getLicenses()
      .then(setLicenses)
      .catch((err) => setError(err instanceof Error ? err.message : t('toast.genericError')))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadLicenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, status, sort])

  const filtered = useMemo(() => {
    const rows = licenses.filter((l) => {
      if (status && l.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        const matches = l.key.toLowerCase().includes(q) || l.productName.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
    return [...rows].sort((a, b) => {
      const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      return sort === 'expiry_asc' ? diff : -diff
    })
  }, [licenses, search, status, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = search !== '' || status !== ''
  function clearFilters() {
    setSearchInput('')
    setStatus('')
  }

  const emptyTitle = licenses.length === 0 ? t('admin.licenses.noLicenses') : t('common.noResults')

  function openModal() {
    reset(defaultValues())
    setSubmitError(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSubmitting) return
    setIsModalOpen(false)
  }

  async function onSubmit(values: LicenseFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const product = KASPERSKY_PRODUCTS.find((p) => p.id === values.productId)
      const created = await inventoryService.addLicense({
        key: values.key,
        productId: values.productId,
        productName: product?.name ?? values.productId,
        duration: values.duration,
        expiryDate: new Date(values.expiryDate).toISOString(),
      })
      setLicenses((prev) => [created, ...prev])
      setIsModalOpen(false)
      showToast(t('admin.licenses.added'), 'success')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key)
      showToast(t('common.copied'), 'success')
    } catch {
      showToast(t('toast.genericError'), 'error')
    }
  }

  return (
    <div>
      <Seo title={t('admin.licenses.title')} />
      <PageHeader
        title={t('admin.licenses.title')}
        description={t('admin.licenses.description')}
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={openModal}>
            {t('admin.licenses.addNew')}
          </Button>
        }
      />

      <AdminToolbar
        resultText={t('admin.licenses.resultsCount', { count: filtered.length })}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        clearLabel={t('common.clearFilter')}
      >
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.licenses.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as LicenseStatus | '')}
          placeholder={t('common.all')}
          className="sm:w-56"
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: t(`admin.licenses.statuses.${s}`) }))}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as LicenseSort)}
          className="sm:w-56"
          options={[
            { value: 'expiry_asc', label: t('admin.services.sortExpiryAsc') },
            { value: 'expiry_desc', label: t('admin.services.sortExpiryDesc') },
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
              onClick={loadLicenses}
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
              rowKey={(l) => l.id}
              emptyTitle={emptyTitle}
              columns={[
                {
                  key: 'key',
                  header: t('admin.licenses.key'),
                  render: (l) => (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{maskLicenseKey(l.key)}</span>
                      <button
                        type="button"
                        onClick={() => copyKey(l.key)}
                        aria-label={`${t('common.copy')} — ${l.key}`}
                        title={t('common.copy')}
                        className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary focus-ring"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  ),
                },
                { key: 'product', header: t('admin.licenses.product'), render: (l) => l.productName },
                { key: 'duration', header: t('admin.licenses.duration'), render: (l) => l.duration },
                {
                  key: 'status',
                  header: t('admin.licenses.status'),
                  render: (l) => (
                    <Badge variant={STATUS_VARIANT[l.status]}>
                      {t(`admin.licenses.statuses.${l.status}`)}
                    </Badge>
                  ),
                },
                {
                  key: 'assignedOrder',
                  header: t('admin.licenses.assignedOrder'),
                  render: (l) => l.assignedOrderCode ?? t('admin.licenses.unassigned'),
                },
                {
                  key: 'expiryDate',
                  header: t('admin.licenses.expiryDate'),
                  render: (l) => <span className="font-data">{formatDate(l.expiryDate, locale)}</span>,
                },
              ]}
            />
          </div>

          <div className="sm:hidden">
            <AdminMobileList
              data={pageItems}
              isLoading={isLoading}
              rowKey={(l) => l.id}
              emptyTitle={emptyTitle}
              renderCard={(l) => (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{maskLicenseKey(l.key)}</span>
                      <button
                        type="button"
                        onClick={() => copyKey(l.key)}
                        aria-label={`${t('common.copy')} — ${l.key}`}
                        className="rounded-lg p-1 text-text-secondary hover:bg-surface focus-ring"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                    <Badge variant={STATUS_VARIANT[l.status]}>
                      {t(`admin.licenses.statuses.${l.status}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {l.productName} &middot; {l.duration}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {l.assignedOrderCode ?? t('admin.licenses.unassigned')} &middot;{' '}
                    {formatDate(l.expiryDate, locale)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={t('admin.licenses.modalTitle')}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Input label={t('admin.licenses.key')} {...register('key', { required: true })} />
            <Select
              label={t('admin.licenses.product')}
              {...register('productId', { required: true })}
              options={KASPERSKY_PRODUCTS.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label={t('admin.licenses.duration')}
              {...register('duration', { required: true })}
            />
            <Input
              type="date"
              label={t('admin.licenses.expiryDate')}
              {...register('expiryDate', { required: true })}
            />
          </div>
          {submitError && (
            <p role="alert" className="text-sm text-red-500">
              {submitError}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
              {t('admin.licenses.cancel')}
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {t('admin.licenses.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
