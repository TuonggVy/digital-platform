import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/admin/DataTable'
import { useSharedServiceColumns } from './serviceColumns'
import type { CloudService } from '@/types'

interface CloudServicesTableProps {
  data: CloudService[]
  isLoading?: boolean
  emptyTitle?: string
}

export function CloudServicesTable({ data, isLoading, emptyTitle }: CloudServicesTableProps) {
  const { t } = useTranslation()
  const { orderPackageColumn, expiryColumn, statusColumn } = useSharedServiceColumns<CloudService>()

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      rowKey={(s) => s.id}
      emptyTitle={emptyTitle}
      columns={[
        orderPackageColumn,
        {
          key: 'specs',
          header: t('admin.services.specs'),
          render: (s) => (
            <div className="flex flex-col">
              <span className="font-data text-xs">{s.ip}</span>
              <span className="text-xs text-text-secondary">
                {s.cpu} &middot; {s.ram} &middot; {s.ssd}
              </span>
            </div>
          ),
        },
        { key: 'region', header: t('admin.services.region'), render: (s) => s.region },
        expiryColumn,
        statusColumn,
      ]}
    />
  )
}
