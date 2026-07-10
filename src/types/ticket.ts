export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface TicketReply {
  id: string
  author: 'customer' | 'admin'
  authorName: string
  message: string
  createdAt: string
}

export interface SupportTicket {
  id: string
  ticketCode: string
  userId: string
  category: 'cloud' | 'kaspersky' | 'esim' | 'billing' | 'account'
  relatedServiceId?: string
  subject: string
  priority: TicketPriority
  status: TicketStatus
  message: string
  attachmentName?: string
  replies: TicketReply[]
  createdAt: string
  updatedAt: string
}
