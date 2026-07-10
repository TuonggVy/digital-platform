import type { SupportTicket, TicketPriority, TicketStatus } from '@/types'
import { mockTickets } from '@/data/mocks/tickets'
import { STORAGE_KEYS } from '@/constants/config'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { generateId, generateTicketCode } from '@/utils/generators'

const repo = createRepository<SupportTicket>(STORAGE_KEYS.TICKETS, mockTickets)

export interface CreateTicketInput {
  userId: string
  category: SupportTicket['category']
  relatedServiceId?: string
  subject: string
  priority: TicketPriority
  message: string
  attachmentName?: string
}

export const ticketService = {
  async getTicketsByUser(userId: string): Promise<SupportTicket[]> {
    await delay()
    return repo
      .getAll()
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getTicketById(id: string): Promise<SupportTicket | null> {
    await delay()
    return repo.getAll().find((t) => t.id === id) ?? null
  },

  async getAllTickets(): Promise<SupportTicket[]> {
    await delay()
    return repo
      .getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async createTicket(input: CreateTicketInput): Promise<SupportTicket> {
    await delay(400, 700)
    const now = new Date().toISOString()
    const ticket: SupportTicket = {
      id: generateId('ticket'),
      ticketCode: generateTicketCode(),
      userId: input.userId,
      category: input.category,
      relatedServiceId: input.relatedServiceId,
      subject: input.subject,
      priority: input.priority,
      status: 'OPEN',
      message: input.message,
      attachmentName: input.attachmentName,
      replies: [],
      createdAt: now,
      updatedAt: now,
    }
    repo.saveAll([ticket, ...repo.getAll()])
    return ticket
  },

  async updateStatus(id: string, status: TicketStatus): Promise<SupportTicket> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('TICKET_NOT_FOUND')
    all[index] = { ...all[index], status, updatedAt: new Date().toISOString() }
    repo.saveAll(all)
    return all[index]
  },

  async updatePriority(id: string, priority: TicketPriority): Promise<SupportTicket> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('TICKET_NOT_FOUND')
    all[index] = { ...all[index], priority, updatedAt: new Date().toISOString() }
    repo.saveAll(all)
    return all[index]
  },

  async addReply(
    id: string,
    author: 'customer' | 'admin',
    authorName: string,
    message: string,
  ): Promise<SupportTicket> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('TICKET_NOT_FOUND')
    const reply = {
      id: generateId('reply'),
      author,
      authorName,
      message,
      createdAt: new Date().toISOString(),
    }
    all[index] = {
      ...all[index],
      replies: [...all[index].replies, reply],
      updatedAt: new Date().toISOString(),
    }
    repo.saveAll(all)
    return all[index]
  },
}
