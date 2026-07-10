import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Coupon } from '@/types'
import { couponService } from '@/services/couponService'
import { STORAGE_KEYS } from '@/constants/config'
import { generateId } from '@/utils/generators'

function computeTotals(items: CartItem[], appliedCoupon: Coupon | null) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  if (!appliedCoupon) return { subtotal, discount: 0, total: subtotal }

  const applicableItems = appliedCoupon.appliesToCategory
    ? items.filter((i) => i.category === appliedCoupon.appliesToCategory)
    : items
  const applicableSubtotal = applicableItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discount =
    appliedCoupon.type === 'percent'
      ? Math.round((applicableSubtotal * appliedCoupon.value) / 100)
      : Math.min(appliedCoupon.value, applicableSubtotal)

  return { subtotal, discount, total: Math.max(subtotal - discount, 0) }
}

interface CartState {
  items: CartItem[]
  appliedCoupon: Coupon | null
  subtotal: number
  discount: number
  total: number
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateItem: (cartItemId: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  applyCoupon: (code: string) => Promise<Coupon>
  removeCoupon: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      subtotal: 0,
      discount: 0,
      total: 0,

      addItem: (item) => {
        const cartItem: CartItem = { ...item, cartItemId: generateId('cart') }
        const items = [...get().items, cartItem]
        set({ items, ...computeTotals(items, get().appliedCoupon) })
      },

      removeItem: (cartItemId) => {
        const items = get().items.filter((i) => i.cartItemId !== cartItemId)
        set({ items, ...computeTotals(items, get().appliedCoupon) })
      },

      updateQuantity: (cartItemId, quantity) => {
        const items = get().items.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i,
        )
        set({ items, ...computeTotals(items, get().appliedCoupon) })
      },

      updateItem: (cartItemId, updates) => {
        const items = get().items.map((i) =>
          i.cartItemId === cartItemId ? { ...i, ...updates } : i,
        )
        set({ items, ...computeTotals(items, get().appliedCoupon) })
      },

      clearCart: () => set({ items: [], appliedCoupon: null, subtotal: 0, discount: 0, total: 0 }),

      applyCoupon: async (code) => {
        const { coupon, discountAmount } = await couponService.validateCoupon(
          code,
          get().items,
          get().subtotal,
        )
        const items = get().items
        const totals = computeTotals(items, coupon)
        set({
          appliedCoupon: coupon,
          subtotal: totals.subtotal,
          discount: discountAmount,
          total: Math.max(totals.subtotal - discountAmount, 0),
        })
        return coupon
      },

      removeCoupon: () => {
        const items = get().items
        set({ appliedCoupon: null, ...computeTotals(items, null) })
      },
    }),
    {
      name: STORAGE_KEYS.CART,
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        subtotal: state.subtotal,
        discount: state.discount,
        total: state.total,
      }),
    },
  ),
)
