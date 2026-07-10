import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { serviceService } from '@/services/serviceService'
import type { CloudService, CustomerService, EsimService, KasperskyService } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Tabs } from '@/components/common/Tabs'
import { ServiceStatusBadge } from '@/components/common/ServiceStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { formatDate } from '@/utils/formatters'

type ServiceType = 'cloud' | 'kaspersky' | 'esim'

export function AdminServicesPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [services, setServices] = useState<CustomerService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ServiceType>('cloud')

  useEffect(() => {
    serviceService
      .getAllForAdmin()
      .then(setServices)
      .finally(() => setIsLoading(false))
  }, [])

  const cloudServices = services.filter((s): s is CloudService => s.type === 'cloud')
  const kasperskyServices = services.filter((s): s is KasperskyService => s.type === 'kaspersky')
  const esimServices = services.filter((s): s is EsimService => s.type === 'esim')

  return (
    <div>
      <Seo title={t('admin.services.title')} />
      <PageHeader title={t('admin.services.title')} />

      <div className="mb-5">
        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as ServiceType)}
          tabs={[
            { value: 'cloud', label: t('nav.megamenu.cloud') },
            { value: 'kaspersky', label: t('nav.megamenu.kaspersky') },
            { value: 'esim', label: t('nav.megamenu.esim') },
          ]}
        />
      </div>

      {activeTab === 'cloud' && (
        <DataTable
          data={cloudServices}
          isLoading={isLoading}
          rowKey={(s) => s.id}
          emptyTitle={t('admin.services.noServices')}
          columns={[
            { key: 'orderCode', header: t('admin.services.orderCode'), render: (s) => s.orderCode },
            { key: 'product', header: t('admin.products.name'), render: (s) => s.productName },
            {
              key: 'package',
              header: t('admin.services.packageName'),
              render: (s) => s.packageName,
            },
            { key: 'ip', header: t('admin.services.ip'), render: (s) => s.ip },
            { key: 'cpu', header: t('admin.services.cpu'), render: (s) => s.cpu },
            { key: 'ram', header: t('admin.services.ram'), render: (s) => s.ram },
            { key: 'ssd', header: t('admin.services.ssd'), render: (s) => s.ssd },
            { key: 'region', header: t('admin.services.region'), render: (s) => s.region },
            {
              key: 'expiry',
              header: t('admin.services.expiryDate'),
              render: (s) => formatDate(s.expiryDate, locale),
            },
            {
              key: 'status',
              header: t('admin.products.status'),
              render: (s) => <ServiceStatusBadge status={s.status} />,
            },
          ]}
        />
      )}

      {activeTab === 'kaspersky' && (
        <DataTable
          data={kasperskyServices}
          isLoading={isLoading}
          rowKey={(s) => s.id}
          emptyTitle={t('admin.services.noServices')}
          columns={[
            { key: 'orderCode', header: t('admin.services.orderCode'), render: (s) => s.orderCode },
            { key: 'product', header: t('admin.products.name'), render: (s) => s.productName },
            {
              key: 'package',
              header: t('admin.services.packageName'),
              render: (s) => s.packageName,
            },
            {
              key: 'licenseKey',
              header: t('admin.services.licenseKey'),
              render: (s) => s.licenseKey,
            },
            { key: 'devices', header: t('admin.services.devices'), render: (s) => s.devices },
            {
              key: 'expiry',
              header: t('admin.services.expiryDate'),
              render: (s) => formatDate(s.expiryDate, locale),
            },
            {
              key: 'status',
              header: t('admin.products.status'),
              render: (s) => <ServiceStatusBadge status={s.status} />,
            },
          ]}
        />
      )}

      {activeTab === 'esim' && (
        <DataTable
          data={esimServices}
          isLoading={isLoading}
          rowKey={(s) => s.id}
          emptyTitle={t('admin.services.noServices')}
          columns={[
            { key: 'orderCode', header: t('admin.services.orderCode'), render: (s) => s.orderCode },
            { key: 'product', header: t('admin.products.name'), render: (s) => s.productName },
            {
              key: 'package',
              header: t('admin.services.packageName'),
              render: (s) => s.packageName,
            },
            { key: 'country', header: t('admin.services.country'), render: (s) => s.country },
            {
              key: 'dataAmount',
              header: t('admin.services.dataAmount'),
              render: (s) => s.dataAmount,
            },
            { key: 'days', header: t('admin.services.days'), render: (s) => s.days },
            {
              key: 'expiry',
              header: t('admin.services.expiryDate'),
              render: (s) => formatDate(s.expiryDate, locale),
            },
            {
              key: 'status',
              header: t('admin.products.status'),
              render: (s) => <ServiceStatusBadge status={s.status} />,
            },
          ]}
        />
      )}
    </div>
  )
}
