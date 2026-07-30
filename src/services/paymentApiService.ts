import { apiGet, apiPost } from './apiClient'

/**
 * 'VNPAY' is FE-only for now — the backend `PaymentMethod` enum
 * (backend/src/features/payments/enums/payment-method.enum.ts) only defines
 * SANDBOX and BANK_TRANSFER, so `POST /payments` with method VNPAY currently
 * fails class-validator's `@IsEnum` check (400). Kept in this union so the UI,
 * types, and request plumbing are ready the moment the backend adds VNPay —
 * see `createPayment` below for the adapter this implies.
 */
export type PaymentMethod = 'SANDBOX' | 'BANK_TRANSFER' | 'VNPAY'

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
  /**
   * Only meaningful for VNPAY — the URL VNPay should redirect back to after
   * the customer completes/cancels payment. Not part of the current backend
   * `CreatePaymentDto` (only `orderId`/`method`); the ValidationPipe runs with
   * `whitelist: true` (no `forbidNonWhitelisted`), so an extra field here is
   * silently dropped rather than rejected — safe to send today, becomes live
   * the moment the backend DTO adds it.
   */
  returnUrl?: string
}

/**
 * TODO(VNPay backend): once implemented, `POST /payments` should return
 * `{ payment, paymentUrl }` for method VNPAY so the FE can redirect the
 * browser to VNPay's hosted checkout. Today the backend still returns the
 * bare `BackendPayment` (no `paymentUrl` field exists yet), so this is a
 * backward-compatible adapter: it accepts either shape and always normalizes
 * to `CreatePaymentResult` — `paymentUrl` is simply `undefined` until the
 * backend starts sending it, and nothing else in the FE needs to change then.
 */
export interface CreatePaymentResult {
  payment: BackendPayment
  paymentUrl?: string
}

type CreatePaymentRawResponse = BackendPayment & { paymentUrl?: string }

export const TERMINAL_PAYMENT_STATUSES: PaymentStatus[] = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED']

export const paymentApiService = {
  async createPayment(payload: CreatePaymentRequest): Promise<CreatePaymentResult> {
    const { paymentUrl, ...payment } = await apiPost<CreatePaymentRawResponse>('/payments', payload)
    return { payment, paymentUrl }
  },

  async getPaymentsForOrder(orderId: string): Promise<BackendPayment[]> {
    return apiGet<BackendPayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`)
  },

  /** Development/test only — backend rejects with 403 when NODE_ENV=production. */
  async sandboxComplete(paymentId: string, result: SandboxResult): Promise<BackendPayment> {
    return apiPost<BackendPayment>(`/payments/${encodeURIComponent(paymentId)}/sandbox/complete`, { result })
  },

  /**
   * TODO(VNPay backend): this endpoint does not exist yet — the backend only
   * exposes `POST /payments`, `GET /orders/:orderId/payments`, and the
   * sandbox-complete route (see `payments.controller.ts`). This method is the
   * frontend's expected contract for the VNPay return flow (mirrors the
   * `GET /payments/vnpay/verify-return?...` shape from the checkout redesign
   * brief) so `VnpayReturnPage` has a real integration point to call once
   * it's implemented backend-side. Until then, calling this 404s/errors,
   * which `VnpayReturnPage` already renders as a graceful "not found /
   * verification failed" state — the page never trusts the raw VNPay query
   * string as the actual payment result, only this (future) verified response.
   */
  async verifyVnpayReturn(
    query: Record<string, string>,
  ): Promise<{ order: { id: string; orderCode: string; totalAmount: number }; payment: BackendPayment }> {
    return apiGet(`/payments/vnpay/verify-return`, query)
  },
}
