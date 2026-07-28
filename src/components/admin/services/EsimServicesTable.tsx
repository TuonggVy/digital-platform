import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/admin/DataTable'
import { useSharedServiceColumns } from './serviceColumns'
import type { EsimService } from '@/types'

interface EsimServicesTableProps {
  data: EsimService[]
  isLoading?: boolean
  emptyTitle?: string
}

export function EsimServicesTable({ data, isLoading, emptyTitle }: EsimServicesTableProps) {
  const { t } = useTranslation()
  const { orderPackageColumn, expiryColumn, statusColumn } = useSharedServiceColumns<EsimService>()

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      rowKey={(s) => s.id}
      emptyTitle={emptyTitle}
      columns={[
        orderPackageColumn,
        { key: 'country', header: t('admin.services.country'), render: (s) => s.country },
        {
          key: 'dataAmount',
          header: t('admin.services.dataAmount'),
          render: (s) => (
            <span>
              {s.dataAmount} &middot; {s.days} {t('admin.services.daysUnit')}
            </span>
          ),
        },
        expiryColumn,
        statusColumn,
      ]}
    />
  )
}
