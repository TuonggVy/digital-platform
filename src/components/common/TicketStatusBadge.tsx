import { useTranslation } from 'react-i18next'
import type { TicketPriority, TicketStatus } from '@/types'
import { Badge } from './Badge'

const statusVariant: Record<TicketStatus, 'warning' | 'success' | 'primary' | 'neutral'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'primary',
  RESOLVED: 'success',
  CLOSED: 'neutral',
}

const priorityVariant: Record<TicketPriority, 'neutral' | 'primary' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'danger',
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const { t } = useTranslation()
  return <Badge variant={statusVariant[status]}>{t(`status.ticket.${status}`)}</Badge>
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const { t } = useTranslation()
  return (
    <Badge variant={priorityVariant[priority]}>{t(`account.tickets.priorities.${priority}`)}</Badge>
  )
}
