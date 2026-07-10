import { create } from 'zustand'
import type { Order, OrderStatus } from '@/types'
import { orderService, type CreateOrderInput } from '@/services/orderService'

interface OrderState {
  orders: Order[]
  isLoading: boolean
  fetchOrdersByUser: (userId: string) => Promise<void>
  createOrder: (input: CreateOrderInput) => Promise<Order>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  getOrderByCode: (orderCode: string) => Promise<Order | null>
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  isLoading: false,

  fetchOrdersByUser: async (userId) => {
    set({ isLoading: true })
    const orders = await orderService.getOrdersByUser(userId)
    set({ orders, isLoading: false })
  },

  createOrder: async (input) => {
    const order = await orderService.createOrder(input)
    set((state) => ({ orders: [order, ...state.orders] }))
    return order
  },

  updateOrderStatus: async (orderId, status) => {
    const updated = await orderService.updateOrderStatus(orderId, status)
    set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? updated : o)) }))
  },

  getOrderByCode: (orderCode) => orderService.getOrderByCode(orderCode),
}))
