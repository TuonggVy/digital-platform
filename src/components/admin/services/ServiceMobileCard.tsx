import { useTranslation } from 'react-i18next'
import { ServiceStatusBadge } from '@/components/common/ServiceStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { formatDate } from '@/utils/formatters'
import type { CustomerService } from '@/types'

interface ServiceMobileCardProps {
  service: CustomerService
}

/** Card body for AdminMobileList rows, shared by the aggregate and Cloud-only services pages. */
export function ServiceMobileCard({ service: s }: ServiceMobileCardProps) {
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium font-data">{s.orderCode}</p>
          <p className="text-xs text-text-secondary">
            {s.productName} &middot; {s.packageName}
          </p>
        </div>
        <ServiceStatusBadge status={s.status} />
      </div>
      {s.type === 'cloud' && (
        <p className="text-xs text-text-secondary">
          {s.ip} &middot; {s.cpu}/{s.ram}/{s.ssd} &middot; {s.region}
        </p>
      )}
      {s.type === 'kaspersky' && (
        <p className="font-mono text-xs text-text-secondary">{s.licenseKey}</p>
      )}
      {s.type === 'esim' && (
        <p className="text-xs text-text-secondary">
          {s.country} &middot; {s.dataAmount} &middot; {s.days} {t('admin.services.daysUnit')}
        </p>
      )}
      <p className="text-xs text-text-secondary">
        {t('admin.services.expiryDate')}: {formatDate(s.expiryDate, locale)}
      </p>
    </div>
  )
}
