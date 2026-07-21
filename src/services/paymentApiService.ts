import { apiGet, apiPost } from './apiClient'

export type PaymentMethod = 'SANDBOX' | 'BANK_TRANSFER'

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'EXPIRED'

export type SandboxResult = 'SUCCESS' | 'FAILURE' | 'CANCEL'

export interface BackendPayment {
  id: string
  paymentCode: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  currency: string
  provider: string
  providerTransactionId: string | null
  failureReason: string | null
  paidAt: string | null
  expiredAt: string | null
  createdDate: string
  modifiedDate: string | null
}

export interface CreatePaymentRequest {
  orderId: string
  method: PaymentMethod
}

export const TERMINAL_PAYMENT_STATUSES: PaymentStatus[] = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED']

export const paymentApiService = {
  async createPayment(payload: CreatePaymentRequest): Promise<BackendPayment> {
    return apiPost<BackendPayment>('/payments', payload)
  },

  async getPaymentsForOrder(orderId: string): Promise<BackendPayment[]> {
    return apiGet<BackendPayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`)
  },

  /** Development/test only — backend rejects with 403 when NODE_ENV=production. */
  async sandboxComplete(paymentId: string, result: SandboxResult): Promise<BackendPayment> {
    return apiPost<BackendPayment>(`/payments/${encodeURIComponent(paymentId)}/sandbox/complete`, { result })
  },
}
