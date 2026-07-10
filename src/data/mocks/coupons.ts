import type { Coupon } from '@/types'

export const mockCoupons: Coupon[] = [
  {
    code: 'NOVA10',
    type: 'percent',
    value: 10,
    description: { vi: 'Giảm 10% cho mọi đơn hàng', en: '10% off any order' },
  },
  {
    code: 'WELCOME50',
    type: 'fixed',
    value: 50000,
    description: { vi: 'Giảm 50.000₫ cho khách hàng mới', en: 'VND 50,000 off for new customers' },
  },
  {
    code: 'CLOUD15',
    type: 'percent',
    value: 15,
    appliesToCategory: 'cloud',
    description: { vi: 'Giảm 15% cho sản phẩm Cloud', en: '15% off Cloud products' },
  },
]
