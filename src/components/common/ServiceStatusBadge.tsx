import { useTranslation } from 'react-i18next'
import type { ServiceStatus } from '@/types'
import { Badge } from './Badge'

const statusVariant: Record<
  ServiceStatus,
  'warning' | 'success' | 'primary' | 'neutral' | 'danger'
> = {
  PENDING_ACTIVATION: 'warning',
  ACTIVE: 'success',
  EXPIRING_SOON: 'warning',
  EXPIRED: 'danger',
  SUSPENDED: 'neutral',
}

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  const { t } = useTranslation()
  return <Badge variant={statusVariant[status]}>{t(`status.service.${status}`)}</Badge>
}
