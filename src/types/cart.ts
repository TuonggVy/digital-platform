import type { BillingCycle } from './product'

export interface CartItem {
  cartItemId: string
  productId: string
  productSlug: string
  productName: string
  category: 'cloud' | 'kaspersky' | 'esim'
  packageId: string
  packageName: string
  billingCycle: BillingCycle
  unitPrice: number
  quantity: number
  optionsSummary: string[]
}
