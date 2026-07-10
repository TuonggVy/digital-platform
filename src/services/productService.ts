import type { BillingCycle, Product, ProductCategory } from '@/types'
import { allProducts } from '@/data/mocks/products'
import { STORAGE_KEYS } from '@/constants/config'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { simulateError } from '@/utils/simulateError'
import { generateId } from '@/utils/generators'

const repo = createRepository<Product>(STORAGE_KEYS.PRODUCTS, allProducts)

export interface ProductFilters {
  category?: ProductCategory
  subCategory?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  billingCycle?: BillingCycle
  region?: string
  days?: number
  hotspot?: boolean
  userType?: string
  devices?: number
  sort?: 'featured' | 'price_asc' | 'price_desc'
}

function matchesFilters(product: Product, filters: ProductFilters): boolean {
  if (filters.category && product.category !== filters.category) return false
  if (filters.subCategory && product.subCategory !== filters.subCategory) return false
  if (filters.search) {
    const q = filters.search.toLowerCase()
    const matchesName =
      product.name.vi.toLowerCase().includes(q) || product.name.en.toLowerCase().includes(q)
    if (!matchesName) return false
  }
  if (filters.minPrice !== undefined && product.startingPrice < filters.minPrice) return false
  if (filters.maxPrice !== undefined && product.startingPrice > filters.maxPrice) return false
  if (filters.billingCycle && !product.billingCycles.includes(filters.billingCycle)) return false
  if (filters.region) {
    const hasRegion = product.packages.some(
      (pkg) => pkg.cloud?.regions.includes(filters.region!) || pkg.esim?.region === filters.region,
    )
    if (!hasRegion) return false
  }
  if (filters.days !== undefined) {
    const hasDays = product.packages.some((pkg) => pkg.esim?.days === filters.days)
    if (!hasDays) return false
  }
  if (filters.hotspot) {
    const hasHotspot = product.packages.some((pkg) => pkg.esim?.hotspot)
    if (!hasHotspot) return false
  }
  if (filters.userType) {
    const hasUserType = product.packages.some((pkg) => pkg.kaspersky?.userType === filters.userType)
    if (!hasUserType) return false
  }
  if (filters.devices !== undefined) {
    const hasDevices = product.packages.some((pkg) => pkg.kaspersky?.devices === filters.devices)
    if (!hasDevices) return false
  }
  return true
}

function sortProducts(products: Product[], sort?: ProductFilters['sort']): Product[] {
  const sorted = [...products]
  if (sort === 'price_asc') sorted.sort((a, b) => a.startingPrice - b.startingPrice)
  else if (sort === 'price_desc') sorted.sort((a, b) => b.startingPrice - a.startingPrice)
  else sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  return sorted
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    await delay()
    simulateError('products.getProducts')
    const active = repo.getAll().filter((p) => p.isActive)
    return sortProducts(
      active.filter((p) => matchesFilters(p, filters)),
      filters.sort,
    )
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    await delay()
    simulateError('products.getProductBySlug')
    return repo.getAll().find((p) => p.slug === slug) ?? null
  },

  async getFeaturedProducts(limit = 6): Promise<Product[]> {
    await delay()
    return repo
      .getAll()
      .filter((p) => p.isActive && p.isFeatured)
      .slice(0, limit)
  },

  async getRelatedProducts(product: Product): Promise<Product[]> {
    await delay()
    const all = repo.getAll()
    return product.relatedProductIds
      .map((id) => all.find((p) => p.id === id))
      .filter((p): p is Product => !!p)
  },

  async getAllForAdmin(): Promise<Product[]> {
    await delay()
    return repo.getAll()
  },

  async createProduct(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await delay()
    const now = new Date().toISOString()
    const product: Product = { ...input, id: generateId('product'), createdAt: now, updatedAt: now }
    const all = repo.getAll()
    repo.saveAll([product, ...all])
    return product
  },

  async updateProduct(id: string, input: Partial<Product>): Promise<Product> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Product not found')
    const updated: Product = { ...all[index], ...input, id, updatedAt: new Date().toISOString() }
    all[index] = updated
    repo.saveAll(all)
    return updated
  },

  async deleteProduct(id: string): Promise<void> {
    await delay()
    const all = repo.getAll().filter((p) => p.id !== id)
    repo.saveAll(all)
  },
}
