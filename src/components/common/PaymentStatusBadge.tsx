import { useTranslation } from 'react-i18next'
import type { PaymentStatus } from '@/services/paymentApiService'
import { Badge } from './Badge'

// Kept aligned with the order-status semantic mapping (BackendOrderStatusBadge /
// OrderStatusBadge): a cancelled or expired payment is a real failure-adjacent
// outcome, not a neutral one, so it gets the same weight as order CANCELLED/FAILED.
const variantMap: Record<PaymentStatus, 'warning' | 'success' | 'primary' | 'neutral' | 'danger'> = {
  PENDING: 'warning',
  PROCESSING: 'primary',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  CANCELLED: 'danger',
  EXPIRED: 'danger',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()
  return <Badge variant={variantMap[status]}>{t(`status.backendPayment.${status}`)}</Badge>
}
