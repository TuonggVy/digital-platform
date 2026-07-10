import type { Product } from '@/types'
import { cloudProducts } from './products.cloud'
import { kasperskyProducts } from './products.kaspersky'
import { esimProducts } from './products.esim'

esimProducts.forEach((p, idx) => {
  p.relatedProductIds = esimProducts
    .filter((_, i) => i !== idx)
    .slice(0, 3)
    .map((r) => r.id)
})

export const allProducts: Product[] = [...cloudProducts, ...kasperskyProducts, ...esimProducts]

export { cloudProducts, kasperskyProducts, esimProducts }
