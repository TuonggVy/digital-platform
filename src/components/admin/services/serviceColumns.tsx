import { useTranslation } from 'react-i18next'
import type { DataTableColumn } from '@/components/admin/DataTable'
import { ServiceStatusBadge } from '@/components/common/ServiceStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { formatDate } from '@/utils/formatters'
import type { CustomerService } from '@/types'

interface SharedServiceColumns<T extends CustomerService> {
  orderPackageColumn: DataTableColumn<T>
  expiryColumn: DataTableColumn<T>
  statusColumn: DataTableColumn<T>
}

/** Columns shared by every service type's table (Cloud/Kaspersky/eSIM). */
export function useSharedServiceColumns<T extends CustomerService>(): SharedServiceColumns<T> {
  const { t } = useTranslation()
  const locale = useLocale()

  const orderPackageColumn: DataTableColumn<T> = {
    key: 'orderPackage',
    header: t('admin.services.orderCode'),
    render: (s) => (
      <div className="flex flex-col">
        <span className="font-medium font-data">{s.orderCode}</span>
        <span className="text-xs text-text-secondary">
          {s.productName} &middot; {s.packageName}
        </span>
      </div>
    ),
  }
  const expiryColumn: DataTableColumn<T> = {
    key: 'expiry',
    header: t('admin.services.expiryDate'),
    render: (s) => <span className="font-data">{formatDate(s.expiryDate, locale)}</span>,
  }
  const statusColumn: DataTableColumn<T> = {
    key: 'status',
    header: t('admin.products.status'),
    render: (s) => <ServiceStatusBadge status={s.status} />,
  }

  return { orderPackageColumn, expiryColumn, statusColumn }
}
