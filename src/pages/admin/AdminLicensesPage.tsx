import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import type { LicenseStatus, LicenseStockItem } from '@/data/mocks/licenses'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { useLocale } from '@/hooks/useLocale'
import { formatDate, maskLicenseKey } from '@/utils/formatters'
import { useUiStore } from '@/stores/uiStore'

const KASPERSKY_PRODUCTS = [
  { id: 'kaspersky-standard', name: 'Kaspersky Standard' },
  { id: 'kaspersky-plus', name: 'Kaspersky Plus' },
  { id: 'kaspersky-premium', name: 'Kaspersky Premium' },
  { id: 'kaspersky-small-office-security', name: 'Kaspersky Small Office Security' },
]

const STATUS_VARIANT: Record<LicenseStatus, 'success' | 'primary' | 'danger'> = {
  AVAILABLE: 'success',
  ASSIGNED: 'primary',
  EXPIRED: 'danger',
}

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm<LicenseFormValues>({
    defaultValues: defaultValues(),
  })

  useEffect(() => {
    inventoryService
      .getLicenses()
      .then(setLicenses)
      .finally(() => setIsLoading(false))
  }, [])

  function openModal() {
    reset(defaultValues())
    setIsModalOpen(true)
  }

  async function onSubmit(values: LicenseFormValues) {
    setIsSubmitting(true)
    try {
      const product = KASPERSKY_PRODUCTS.find((p) => p.id === values.productId)
      const created = await inventoryService.addLicense({
        key: values.key,
        productId: values.productId,
        productName: product?.name ?? values.productId,
        duration: values.duration,
        expiryDate: new Date(values.expiryDate || Date.now()).toISOString(),
      })
      setLicenses((prev) => [created, ...prev])
      setIsModalOpen(false)
      showToast(t('admin.licenses.added'), 'success')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Seo title={t('admin.licenses.title')} />
      <PageHeader
        title={t('admin.licenses.title')}
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={openModal}>
            {t('admin.licenses.addNew')}
          </Button>
        }
      />

      <DataTable
        data={licenses}
        isLoading={isLoading}
        rowKey={(l) => l.id}
        columns={[
          {
            key: 'key',
            header: t('admin.licenses.key'),
            render: (l) => <span className="font-mono text-xs">{maskLicenseKey(l.key)}</span>,
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
            render: (l) => formatDate(l.expiryDate, locale),
          },
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('admin.licenses.modalTitle')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label={t('admin.licenses.key')} {...register('key', { required: true })} />
          <Select
            label={t('admin.licenses.product')}
            {...register('productId', { required: true })}
            options={KASPERSKY_PRODUCTS.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Input
            label={t('admin.licenses.duration')}
            {...register('duration', { required: true })}
          />
          <Input
            type="date"
            label={t('admin.licenses.expiryDate')}
            {...register('expiryDate', { required: true })}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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
