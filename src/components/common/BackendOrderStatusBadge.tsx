import { useTranslation } from 'react-i18next'
import type { OrderStatus as BackendOrderStatus } from '@/services/orderApiService'
import { Badge } from './Badge'

/**
 * Backend `OrderStatus` has 8 values, distinct from the mock `OrderStatus`
 * (6 values) that `OrderStatusBadge` renders for the still-mock Admin/legacy
 * pages — kept as a separate component so neither status enum has to be
 * mapped onto the other.
 */
const variantMap: Record<BackendOrderStatus, 'warning' | 'success' | 'primary' | 'neutral' | 'danger'> = {
  PENDING: 'warning',
  AWAITING_PAYMENT: 'warning',
  PAID: 'primary',
  PROCESSING: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  FAILED: 'danger',
  REFUNDED: 'neutral',
}

export function BackendOrderStatusBadge({ status }: { status: BackendOrderStatus }) {
  const { t } = useTranslation()
  return <Badge variant={variantMap[status]}>{t(`status.backendOrder.${status}`)}</Badge>
}
