import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import type { EsimStockItem, EsimStockStatus } from '@/data/mocks/esimInventory'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { useUiStore } from '@/stores/uiStore'

const ESIM_PRODUCTS = [
  { id: 'esim-japan-5gb', name: 'eSIM Nhật Bản 5GB' },
  { id: 'esim-korea-unlimited', name: 'eSIM Hàn Quốc Unlimited' },
  { id: 'esim-europe', name: 'eSIM Châu Âu' },
  { id: 'esim-global', name: 'eSIM Toàn cầu' },
  { id: 'esim-usa-unlimited', name: 'eSIM Hoa Kỳ Unlimited' },
]

const STATUS_VARIANT: Record<EsimStockStatus, 'success' | 'primary' | 'neutral'> = {
  AVAILABLE: 'success',
  ASSIGNED: 'primary',
  USED: 'neutral',
}

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm<EsimFormValues>({
    defaultValues: defaultValues(),
  })

  useEffect(() => {
    inventoryService
      .getEsimStock()
      .then(setItems)
      .finally(() => setIsLoading(false))
  }, [])

  function openModal() {
    reset(defaultValues())
    setIsModalOpen(true)
  }

  async function onSubmit(values: EsimFormValues) {
    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Seo title={t('admin.esims.title')} />
      <PageHeader
        title={t('admin.esims.title')}
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={openModal}>
            {t('admin.esims.addNew')}
          </Button>
        }
      />

      <DataTable
        data={items}
        isLoading={isLoading}
        rowKey={(i) => i.id}
        columns={[
          {
            key: 'code',
            header: t('admin.esims.code'),
            render: (i) => <span className="font-mono text-xs">{i.code}</span>,
          },
          { key: 'country', header: t('admin.esims.country'), render: (i) => i.country },
          { key: 'dataAmount', header: t('admin.esims.dataAmount'), render: (i) => i.dataAmount },
          { key: 'days', header: t('admin.esims.days'), render: (i) => i.days },
          {
            key: 'status',
            header: t('admin.esims.status'),
            render: (i) => (
              <Badge variant={STATUS_VARIANT[i.status]}>
                {t(`admin.esims.statuses.${i.status}`)}
              </Badge>
            ),
          },
          {
            key: 'assignedOrder',
            header: t('admin.esims.assignedOrder'),
            render: (i) => i.assignedOrderCode ?? t('admin.licenses.unassigned'),
          },
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('admin.esims.modalTitle')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label={t('admin.esims.code')} {...register('code', { required: true })} />
          <Select
            label={t('admin.esims.product')}
            {...register('productId', { required: true })}
            options={ESIM_PRODUCTS.map((p) => ({ value: p.id, label: p.name }))}
          />
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
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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
