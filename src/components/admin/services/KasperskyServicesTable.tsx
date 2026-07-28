import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/admin/DataTable'
import { useSharedServiceColumns } from './serviceColumns'
import type { KasperskyService } from '@/types'

interface KasperskyServicesTableProps {
  data: KasperskyService[]
  isLoading?: boolean
  emptyTitle?: string
}

export function KasperskyServicesTable({ data, isLoading, emptyTitle }: KasperskyServicesTableProps) {
  const { t } = useTranslation()
  const { orderPackageColumn, expiryColumn, statusColumn } = useSharedServiceColumns<KasperskyService>()

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      rowKey={(s) => s.id}
      emptyTitle={emptyTitle}
      columns={[
        orderPackageColumn,
        {
          key: 'licenseKey',
          header: t('admin.services.licenseKey'),
          render: (s) => <span className="font-mono text-xs">{s.licenseKey}</span>,
        },
        { key: 'devices', header: t('admin.services.devices'), render: (s) => s.devices },
        expiryColumn,
        statusColumn,
      ]}
    />
  )
}
