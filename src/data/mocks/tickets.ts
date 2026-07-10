import type { SupportTicket } from '@/types'

export const mockTickets: SupportTicket[] = [
  {
    id: 'ticket-001',
    ticketCode: 'TK-0625001',
    userId: 'user-001',
    category: 'cloud',
    relatedServiceId: 'svc-cloud-001',
    subject: 'Không thể SSH vào máy chủ',
    priority: 'HIGH',
    status: 'RESOLVED',
    message: 'Tôi không thể kết nối SSH vào máy chủ Cloud Server Business từ sáng nay.',
    replies: [
      {
        id: 'reply-001',
        author: 'admin',
        authorName: 'VTC TELECOM Support',
        message:
          'Chào bạn, chúng tôi đã kiểm tra và khởi động lại dịch vụ mạng trên máy chủ. Bạn vui lòng thử lại giúp mình nhé.',
        createdAt: '2025-06-20T03:00:00.000Z',
      },
    ],
    createdAt: '2025-06-20T01:00:00.000Z',
    updatedAt: '2025-06-20T03:00:00.000Z',
  },
  {
    id: 'ticket-002',
    ticketCode: 'TK-0625002',
    userId: 'user-001',
    category: 'kaspersky',
    relatedServiceId: 'svc-kaspersky-002',
    subject: 'Cần hướng dẫn gia hạn license',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    message: 'License Kaspersky Standard của tôi sắp hết hạn, cho tôi xin hướng dẫn gia hạn.',
    replies: [
      {
        id: 'reply-002',
        author: 'admin',
        authorName: 'VTC TELECOM Support',
        message:
          'Chào bạn, bạn có thể vào mục Dịch vụ của tôi > Kaspersky và bấm Gia hạn để tiếp tục sử dụng.',
        createdAt: '2025-07-02T04:00:00.000Z',
      },
    ],
    createdAt: '2025-07-01T09:00:00.000Z',
    updatedAt: '2025-07-02T04:00:00.000Z',
  },
  {
    id: 'ticket-003',
    ticketCode: 'TK-0725003',
    userId: 'user-001',
    category: 'esim',
    subject: 'Không nhận được mã QR eSIM',
    priority: 'URGENT',
    status: 'OPEN',
    message: 'Tôi đã thanh toán gói eSIM Japan nhưng chưa nhận được mã QR để kích hoạt.',
    replies: [],
    createdAt: '2025-07-08T07:00:00.000Z',
    updatedAt: '2025-07-08T07:00:00.000Z',
  },
  {
    id: 'ticket-004',
    ticketCode: 'TK-0625004',
    userId: 'user-001',
    category: 'billing',
    subject: 'Yêu cầu xuất hóa đơn VAT',
    priority: 'LOW',
    status: 'CLOSED',
    message: 'Tôi cần xuất hóa đơn VAT cho đơn hàng ND10250066789.',
    replies: [
      {
        id: 'reply-003',
        author: 'admin',
        authorName: 'VTC TELECOM Support',
        message: 'Hóa đơn VAT đã được gửi qua email đăng ký của bạn.',
        createdAt: '2025-07-06T02:00:00.000Z',
      },
    ],
    createdAt: '2025-07-05T08:00:00.000Z',
    updatedAt: '2025-07-06T02:00:00.000Z',
  },
]
