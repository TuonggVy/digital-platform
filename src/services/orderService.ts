import type { CartItem, Order, OrderCustomerInfo, OrderStatus, PaymentMethod } from '@/types'
import { mockOrders } from '@/data/mocks/orders'
import { STORAGE_KEYS } from '@/constants/config'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { generateOrderCode, generateId } from '@/utils/generators'
import { serviceService } from './serviceService'

const repo = createRepository<Order>(STORAGE_KEYS.ORDERS, mockOrders)

export interface CreateOrderInput {
  userId: string
  items: CartItem[]
  subtotal: number
  discount: number
  couponCode?: string
  total: number
  paymentMethod: PaymentMethod
  customerInfo: OrderCustomerInfo
}

export const orderService = {
  async createOrder(input: CreateOrderInput): Promise<Order> {
    await delay(400, 700)
    const now = new Date().toISOString()
    const order: Order = {
      id: generateId('order'),
      orderCode: generateOrderCode(),
      userId: input.userId,
      items: input.items.map((item) => ({ ...item, lineTotal: item.unitPrice * item.quantity })),
      subtotal: input.subtotal,
      discount: input.discount,
      couponCode: input.couponCode,
      total: input.total,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'UNPAID',
      orderStatus: 'PENDING_PAYMENT',
      customerInfo: input.customerInfo,
      statusHistory: [{ status: 'PENDING_PAYMENT', timestamp: now }],
      createdAt: now,
      updatedAt: now,
    }
    repo.saveAll([order, ...repo.getAll()])

    // Simulate immediate payment confirmation for the demo checkout flow.
    const paidOrder: Order = {
      ...order,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
      statusHistory: [...order.statusHistory, { status: 'PAID', timestamp: now }],
      updatedAt: now,
    }
    const all = repo.getAll()
    const index = all.findIndex((o) => o.id === order.id)
    all[index] = paidOrder
    repo.saveAll(all)

    await serviceService.createServicesFromOrder(paidOrder)
    return paidOrder
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    await delay()
    return repo
      .getAll()
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getOrderByCode(orderCode: string): Promise<Order | null> {
    await delay()
    return repo.getAll().find((o) => o.orderCode === orderCode) ?? null
  },

  async getAllOrders(): Promise<Order[]> {
    await delay()
    return repo
      .getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((o) => o.id === orderId)
    if (index === -1) throw new Error('ORDER_NOT_FOUND')
    const now = new Date().toISOString()
    all[index] = {
      ...all[index],
      orderStatus: status,
      updatedAt: now,
      statusHistory: [...all[index].statusHistory, { status, timestamp: now }],
    }
    repo.saveAll(all)
    return all[index]
  },
}
