import { useTranslation } from 'react-i18next'
import type { PaymentStatus } from '@/services/paymentApiService'
import { Badge } from './Badge'

const variantMap: Record<PaymentStatus, 'warning' | 'success' | 'primary' | 'neutral' | 'danger'> = {
  PENDING: 'warning',
  PROCESSING: 'primary',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()
  return <Badge variant={variantMap[status]}>{t(`status.backendPayment.${status}`)}</Badge>
}
