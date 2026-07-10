import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ticketService } from '@/services/ticketService'
import type { SupportTicket, TicketPriority, TicketStatus } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Modal } from '@/components/common/Modal'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/common/TicketStatusBadge'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { formatDateTime } from '@/utils/formatters'

const TICKET_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const TICKET_PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export function AdminTicketsPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)
  const currentUser = useAuthStore((s) => s.currentUser)

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  useEffect(() => {
    ticketService
      .getAllTickets()
      .then(setTickets)
      .finally(() => setIsLoading(false))
  }, [])

  const selectedTicket = tickets.find((tk) => tk.id === selectedId) ?? null

  function updateTicketInList(updated: SupportTicket) {
    setTickets((prev) => prev.map((tk) => (tk.id === updated.id ? updated : tk)))
  }

  async function handleStatusChange(status: TicketStatus) {
    if (!selectedTicket) return
    const updated = await ticketService.updateStatus(selectedTicket.id, status)
    updateTicketInList(updated)
  }

  async function handlePriorityChange(priority: TicketPriority) {
    if (!selectedTicket) return
    const updated = await ticketService.updatePriority(selectedTicket.id, priority)
    updateTicketInList(updated)
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyMessage.trim()) return
    setIsSendingReply(true)
    try {
      const updated = await ticketService.addReply(
        selectedTicket.id,
        'admin',
        currentUser?.name ?? 'Admin',
        replyMessage.trim(),
      )
      updateTicketInList(updated)
      setReplyMessage('')
      showToast(t('admin.tickets.replySent'), 'success')
    } finally {
      setIsSendingReply(false)
    }
  }

  return (
    <div>
      <Seo title={t('admin.tickets.title')} />
      <PageHeader title={t('admin.tickets.title')} />

      <DataTable
        data={tickets}
        isLoading={isLoading}
        rowKey={(tk) => tk.id}
        emptyTitle={t('admin.tickets.noTickets')}
        columns={[
          { key: 'code', header: 'Code', render: (tk) => tk.ticketCode },
          { key: 'subject', header: t('account.tickets.subject'), render: (tk) => tk.subject },
          {
            key: 'category',
            header: t('admin.tickets.category'),
            render: (tk) => t(`admin.tickets.categories.${tk.category}`),
          },
          {
            key: 'priority',
            header: t('account.tickets.priority'),
            render: (tk) => <TicketPriorityBadge priority={tk.priority} />,
          },
          {
            key: 'status',
            header: t('admin.products.status'),
            render: (tk) => <TicketStatusBadge status={tk.status} />,
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (tk) => (
              <Button size="sm" variant="outline" onClick={() => setSelectedId(tk.id)}>
                {t('admin.tickets.details')}
              </Button>
            ),
          },
        ]}
      />

      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedId(null)}
        title={selectedTicket?.subject}
        size="lg"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-surface/60 p-3 text-sm">
              <p className="mb-1 text-xs text-text-secondary">
                {selectedTicket.ticketCode} &middot;{' '}
                {formatDateTime(selectedTicket.createdAt, locale)}
              </p>
              <p className="text-text-primary">{selectedTicket.message}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label={t('admin.tickets.updateStatus')}
                value={selectedTicket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                options={TICKET_STATUSES.map((s) => ({ value: s, label: t(`status.ticket.${s}`) }))}
              />
              <Select
                label={t('admin.tickets.updatePriority')}
                value={selectedTicket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                options={TICKET_PRIORITIES.map((p) => ({
                  value: p,
                  label: t(`account.tickets.priorities.${p}`),
                }))}
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">
                {t('admin.tickets.replies')}
              </h3>
              <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                {selectedTicket.replies.length === 0 && (
                  <p className="text-sm text-text-secondary">-</p>
                )}
                {selectedTicket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={
                      reply.author === 'admin'
                        ? 'ml-auto max-w-[85%] rounded-xl bg-primary/10 p-3 text-sm'
                        : 'mr-auto max-w-[85%] rounded-xl bg-surface/60 p-3 text-sm'
                    }
                  >
                    <p className="mb-1 text-xs font-medium text-text-secondary">
                      {reply.authorName} &middot; {formatDateTime(reply.createdAt, locale)}
                    </p>
                    <p className="text-text-primary">{reply.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Textarea
                label={t('admin.tickets.addReply')}
                placeholder={t('admin.tickets.replyPlaceholder')}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={handleSendReply}
                  isLoading={isSendingReply}
                  disabled={!replyMessage.trim()}
                >
                  {t('admin.tickets.addReply')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
