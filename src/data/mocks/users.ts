import type { User } from '@/types'

export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Nguyễn Minh Anh',
    email: 'customer@vtctelecom.vn',
    password: '123456',
    role: 'customer',
    phone: '0901234567',
    company: 'Công ty TNHH ABC',
    taxCode: '0312345678',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    createdAt: '2025-01-05T00:00:00.000Z',
  },
  {
    id: 'admin-001',
    name: 'VTC TELECOM Admin',
    email: 'admin@vtctelecom.vn',
    password: '123456',
    role: 'admin',
    phone: '0909999999',
    createdAt: '2024-12-01T00:00:00.000Z',
  },
]
