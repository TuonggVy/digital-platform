import { apiGet } from './apiClient'
import type { PaginatedResult } from './productService'

export type CustomerStatus = 'ACTIVE' | 'INACTIVE'

export interface AdminCustomer {
  id: string
  fullName: string
  email: string
  phone: string | null
  status: CustomerStatus
  createdDate: string
  modifiedDate: string | null
}

export interface AdminCustomerDetail extends AdminCustomer {
  orderCount: number
  totalSpent: number
  latestPayment: {
    id: string
    paymentCode: string
    status: string
    amount: number
    currency: string
    createdDate: string
    paidAt: string | null
  } | null
}

export interface GetAdminCustomersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: CustomerStatus
  sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc'
}

function withoutUndefined<T extends object>(params?: T): Record<string, unknown> | undefined {
  if (!params) return undefined
  const entries = Object.entries(params).filter(([, value]) => value !== undefined)
  return entries.length ? Object.fromEntries(entries) : undefined
}

export const customerApiService = {
  async getAdminCustomers(params?: GetAdminCustomersParams): Promise<PaginatedResult<AdminCustomer>> {
    return apiGet<PaginatedResult<AdminCustomer>>('/admin/customers', withoutUndefined(params))
  },

  async getAdminCustomerDetail(id: string): Promise<AdminCustomerDetail> {
    return apiGet<AdminCustomerDetail>(`/admin/customers/${encodeURIComponent(id)}`)
  },
}
