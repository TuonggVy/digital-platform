import type { CartItem, Coupon } from '@/types'
import { mockCoupons } from '@/data/mocks/coupons'
import { delay } from '@/utils/delay'

export interface CouponResult {
  coupon: Coupon
  discountAmount: number
}

export const couponService = {
  async validateCoupon(code: string, items: CartItem[], subtotal: number): Promise<CouponResult> {
    await delay(200, 400)
    const coupon = mockCoupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase())
    if (!coupon) throw new Error('COUPON_INVALID')

    const applicableItems = coupon.appliesToCategory
      ? items.filter((i) => i.category === coupon.appliesToCategory)
      : items
    if (coupon.appliesToCategory && applicableItems.length === 0) {
      throw new Error('COUPON_NOT_APPLICABLE')
    }

    const applicableSubtotal = coupon.appliesToCategory
      ? applicableItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      : subtotal

    const discountAmount =
      coupon.type === 'percent'
        ? Math.round((applicableSubtotal * coupon.value) / 100)
        : Math.min(coupon.value, applicableSubtotal)

    return { coupon, discountAmount }
  },
}
