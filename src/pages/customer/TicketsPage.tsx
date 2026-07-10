import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ticketService } from '@/services/ticketService'
import type { SupportTicket } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/common/TicketStatusBadge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'

export function TicketsPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const currentUser = useAuthStore((s) => s.currentUser)

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    setIsLoading(true)
    ticketService.getTicketsByUser(currentUser.id).then((tk) => {
      setTickets(tk)
      setIsLoading(false)
    })
  }, [currentUser])

  return (
    <div className="flex flex-col gap-6">
      <Seo title={t('account.tickets.title')} />

      <RevealOnScroll>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            {t('account.tickets.title')}
          </h1>
          <Link to={ROUTES.ACCOUNT_TICKET_NEW}>
            <Button leftIcon={<Plus className="size-4" />}>{t('account.tickets.newTicket')}</Button>
          </Link>
        </div>
      </RevealOnScroll>

      {isLoading ? (
        <LoadingSpinner className="py-24" label={t('common.loading')} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title={t('account.tickets.empty')}
          action={
            <Link to={ROUTES.ACCOUNT_TICKET_NEW}>
              <Button size="sm">{t('account.tickets.newTicket')}</Button>
            </Link>
          }
        />
      ) : (
        <StaggerContainer className="flex flex-col gap-3">
          {tickets.map((ticket) => {
            const isExpanded = expandedId === ticket.id
            return (
              <StaggerItem key={ticket.id}>
                <div className="rounded-2xl border border-border">
                  <button
                    className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {ticket.ticketCode}
                        </span>
                        <TicketStatusBadge status={ticket.status} />
                        <TicketPriorityBadge priority={ticket.priority} />
                      </div>
                      <p className="text-sm text-text-secondary">{ticket.subject}</p>
                      <p className="text-xs text-text-secondary">
                        {formatDate(ticket.createdAt, locale)}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        'size-5 shrink-0 text-text-secondary transition-transform',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-4 border-t border-border p-5">
                      <div className="rounded-xl bg-surface p-4">
                        <p className="mb-1 text-xs font-medium text-text-secondary">
                          {currentUser?.name}
                        </p>
                        <p className="text-sm text-text-primary">{ticket.message}</p>
                        <p className="mt-2 text-xs text-text-secondary">
                          {formatDateTime(ticket.createdAt, locale)}
                        </p>
                      </div>
                      {ticket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={cn(
                            'rounded-xl p-4',
                            reply.author === 'admin' ? 'bg-primary/5' : 'bg-surface',
                          )}
                        >
                          <p className="mb-1 text-xs font-medium text-text-secondary">
                            {reply.authorName}
                          </p>
                          <p className="text-sm text-text-primary">{reply.message}</p>
                          <p className="mt-2 text-xs text-text-secondary">
                            {formatDateTime(reply.createdAt, locale)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      )}
    </div>
  )
}
