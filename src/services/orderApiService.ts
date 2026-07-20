import type { LocalizedText } from '@/types'
import { apiGet, apiPatch, apiPost } from './apiClient'
import type { PaginatedResult } from './productService'

/**
 * Real backend Orders API (see backend `features/orders`). Named/typed
 * distinctly from `orderService.ts` (the mock checkout/coupon/payment flow
 * still used by Checkout/Admin/Customer pages) to avoid colliding with its
 * `createOrder`/`updateOrderStatus`/`Order`/`OrderStatus` symbols, which have
 * a different shape and no backend equivalent yet (payment, coupon).
 */

export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'

export interface CreateOrderItemRequest {
  productId: string
  packageId?: string
  quantity: number
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[]
  customerName: string
  customerEmail: string
  customerPhone: string
  note?: string
}

export interface BackendOrderItem {
  id: string
  productId: string
  productName: LocalizedText
  productType: string
  packageId: string | null
  packageName: LocalizedText | null
  unitPrice: number
  quantity: number
  totalPrice: number
  createdDate: string
}

export interface BackendOrder {
  id: string
  orderCode: string
  status: OrderStatus
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  note: string | null
  createdDate: string
  modifiedDate: string | null
  items?: BackendOrderItem[]
}

export interface GetMyOrdersParams {
  page?: number
  pageSize?: number
}

export interface GetAdminOrdersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: OrderStatus
  sort?: 'newest' | 'oldest' | 'total_asc' | 'total_desc'
}

function withoutUndefined<T extends object>(params?: T): Record<string, unknown> | undefined {
  if (!params) return undefined
  const entries = Object.entries(params).filter(([, value]) => value !== undefined)
  return entries.length ? Object.fromEntries(entries) : undefined
}

export const orderApiService = {
  // ── Customer ────────────────────────────────────────────────────────────

  async createOrder(payload: CreateOrderRequest): Promise<BackendOrder> {
    return apiPost<BackendOrder>('/orders', payload)
  },

  async getMyOrders(params?: GetMyOrdersParams): Promise<PaginatedResult<BackendOrder>> {
    return apiGet<PaginatedResult<BackendOrder>>('/orders', withoutUndefined(params))
  },

  async getOrderDetail(id: string): Promise<BackendOrder> {
    return apiGet<BackendOrder>(`/orders/${encodeURIComponent(id)}`)
  },

  async cancelOrder(id: string): Promise<BackendOrder> {
    return apiPost<BackendOrder>(`/orders/${encodeURIComponent(id)}/cancel`)
  },

  // ── Admin ───────────────────────────────────────────────────────────────

  async getAdminOrders(params?: GetAdminOrdersParams): Promise<PaginatedResult<BackendOrder>> {
    return apiGet<PaginatedResult<BackendOrder>>('/admin/orders', withoutUndefined(params))
  },

  async getAdminOrderDetail(id: string): Promise<BackendOrder> {
    return apiGet<BackendOrder>(`/admin/orders/${encodeURIComponent(id)}`)
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<BackendOrder> {
    return apiPatch<BackendOrder>(`/admin/orders/${encodeURIComponent(id)}/status`, { status })
  },
}
