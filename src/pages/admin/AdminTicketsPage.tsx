import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { ticketService } from '@/services/ticketService'
import type { SupportTicket, TicketPriority, TicketStatus } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { AdminToolbar } from '@/components/admin/AdminToolbar'
import { AdminMobileList } from '@/components/admin/AdminMobileList'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'
import { Drawer } from '@/components/common/Drawer'
import { Textarea } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/common/TicketStatusBadge'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatDateTime } from '@/utils/formatters'

const TICKET_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const TICKET_PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

type TicketSort = 'updated_desc' | 'updated_asc'
const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

export function AdminTicketsPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)
  const currentUser = useAuthStore((s) => s.currentUser)

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [sort, setSort] = useState<TicketSort>('updated_desc')
  const [page, setPage] = useState(1)

  function loadTickets() {
    setIsLoading(true)
    setError(null)
    ticketService
      .getAllTickets()
      .then(setTickets)
      .catch((err) => setError(err instanceof Error ? err.message : t('toast.genericError')))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, status, priority, sort])

  const selectedTicket = tickets.find((tk) => tk.id === selectedId) ?? null

  function updateTicketInList(updated: SupportTicket) {
    setTickets((prev) => prev.map((tk) => (tk.id === updated.id ? updated : tk)))
  }

  async function handleStatusChange(newStatus: TicketStatus) {
    if (!selectedTicket) return
    try {
      const updated = await ticketService.updateStatus(selectedTicket.id, newStatus)
      updateTicketInList(updated)
    } catch {
      showToast(t('toast.genericError'), 'error')
    }
  }

  async function handlePriorityChange(newPriority: TicketPriority) {
    if (!selectedTicket) return
    try {
      const updated = await ticketService.updatePriority(selectedTicket.id, newPriority)
      updateTicketInList(updated)
    } catch {
      showToast(t('toast.genericError'), 'error')
    }
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyMessage.trim()) return
    setIsSendingReply(true)
    setReplyError(null)
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
    } catch (err) {
      // Keep the draft in `replyMessage` intact on failure — the admin shouldn't have to retype it.
      setReplyError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setIsSendingReply(false)
    }
  }

  function closeDrawer() {
    setSelectedId(null)
    setReplyMessage('')
    setReplyError(null)
  }

  const filtered = useMemo(() => {
    const rows = tickets.filter((tk) => {
      if (status && tk.status !== status) return false
      if (priority && tk.priority !== priority) return false
      if (search) {
        const q = search.toLowerCase()
        const matches =
          tk.ticketCode.toLowerCase().includes(q) || tk.subject.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
    return [...rows].sort((a, b) => {
      const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sort === 'updated_desc' ? -diff : diff
    })
  }, [tickets, search, status, priority, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = search !== '' || status !== '' || priority !== ''
  function clearFilters() {
    setSearchInput('')
    setStatus('')
    setPriority('')
  }

  const emptyTitle = tickets.length === 0 ? t('admin.tickets.noTickets') : t('common.noResults')

  return (
    <div>
      <Seo title={t('admin.tickets.title')} />
      <PageHeader title={t('admin.tickets.title')} description={t('admin.tickets.description')} />

      <AdminToolbar
        resultText={t('admin.tickets.resultsCount', { count: filtered.length })}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        clearLabel={t('common.clearFilter')}
      >
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.tickets.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus | '')}
          placeholder={t('common.all')}
          className="sm:w-48"
          options={TICKET_STATUSES.map((s) => ({ value: s, label: t(`status.ticket.${s}`) }))}
        />
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority | '')}
          placeholder={t('account.tickets.priority')}
          className="sm:w-48"
          options={TICKET_PRIORITIES.map((p) => ({
            value: p,
            label: t(`account.tickets.priorities.${p}`),
          }))}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as TicketSort)}
          className="sm:w-48"
          options={[
            { value: 'updated_desc', label: t('admin.tickets.sortUpdatedDesc') },
            { value: 'updated_asc', label: t('admin.tickets.sortUpdatedAsc') },
          ]}
        />
      </AdminToolbar>

      {error ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title={t('common.error')}
          description={error}
          action={
            <button
              type="button"
              onClick={loadTickets}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
            >
              {t('common.tryAgain')}
            </button>
          }
        />
      ) : (
        <>
          <div className="hidden sm:block">
            <DataTable
              data={pageItems}
              isLoading={isLoading}
              rowKey={(tk) => tk.id}
              emptyTitle={emptyTitle}
              columns={[
                { key: 'code', header: t('admin.tickets.code'), render: (tk) => tk.ticketCode },
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
                  key: 'updatedAt',
                  header: t('admin.tickets.lastUpdated'),
                  render: (tk) => (
                    <span className="font-data text-xs">{formatDateTime(tk.updatedAt, locale)}</span>
                  ),
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
          </div>

          <div className="sm:hidden">
            <AdminMobileList
              data={pageItems}
              isLoading={isLoading}
              rowKey={(tk) => tk.id}
              emptyTitle={emptyTitle}
              renderCard={(tk) => (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{tk.subject}</p>
                      <p className="font-data text-xs text-text-secondary">{tk.ticketCode}</p>
                    </div>
                    <TicketStatusBadge status={tk.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TicketPriorityBadge priority={tk.priority} />
                    <span className="text-xs text-text-secondary">
                      {t(`admin.tickets.categories.${tk.category}`)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {formatDateTime(tk.updatedAt, locale)}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setSelectedId(tk.id)}>
                    {t('admin.tickets.details')}
                  </Button>
                </div>
              )}
            />
          </div>

          {!isLoading && filtered.length > 0 && (
            <div className="mt-5">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <Drawer isOpen={!!selectedTicket} onClose={closeDrawer} title={selectedTicket?.subject} widthClassName="max-w-xl">
        {selectedTicket && (
          <div className="flex flex-col gap-4 p-5">
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
              <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
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
                error={replyError ?? undefined}
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
      </Drawer>
    </div>
  )
}
