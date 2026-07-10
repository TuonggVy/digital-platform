import { useTranslation } from 'react-i18next'
import type { OrderStatus } from '@/types'
import { Badge } from './Badge'

const statusVariant: Record<OrderStatus, 'warning' | 'success' | 'primary' | 'neutral' | 'danger'> =
  {
    PENDING_PAYMENT: 'warning',
    PAID: 'primary',
    PROCESSING: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    REFUNDED: 'neutral',
  }

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return <Badge variant={statusVariant[status]}>{t(`status.order.${status}`)}</Badge>
}
