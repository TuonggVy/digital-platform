import { create } from 'zustand'
import type { Product } from '@/types'
import { productService, type ProductFilters } from '@/services/productService'

interface ProductState {
  products: Product[]
  filters: ProductFilters
  isLoading: boolean
  error: string | null
  setFilters: (filters: Partial<ProductFilters>) => void
  resetFilters: () => void
  fetchProducts: () => Promise<void>
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filters: {},
  isLoading: false,
  error: null,

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  resetFilters: () => set({ filters: {} }),

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const products = await productService.getProducts(get().filters)
      set({ products, isLoading: false })
    } catch {
      set({ isLoading: false, error: 'FETCH_ERROR' })
    }
  },
}))
