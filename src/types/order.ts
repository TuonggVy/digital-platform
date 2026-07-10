import type { CartItem } from './cart'

export type OrderStatus =
  'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED'

export type PaymentMethod = 'bank_transfer' | 'vietqr' | 'e_wallet' | 'international_card'

export interface OrderItem extends CartItem {
  lineTotal: number
}

export interface OrderCustomerInfo {
  fullName: string
  email: string
  phone: string
  company?: string
  taxCode?: string
  note?: string
}

export interface Order {
  id: string
  orderCode: string
  userId: string
  items: OrderItem[]
  subtotal: number
  discount: number
  couponCode?: string
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  customerInfo: OrderCustomerInfo
  statusHistory: { status: OrderStatus; timestamp: string }[]
  createdAt: string
  updatedAt: string
}
