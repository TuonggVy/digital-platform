import type { BillingCycle, LocalizedText, Product, ProductCategory } from '@/types'
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

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

interface BackendProduct {
  id: string
  slug: string
  category: { code: string }
  subCategory: string
  name: LocalizedText
  shortDescription: LocalizedText | null
  description: LocalizedText | null
  icon: string | null
  badge: LocalizedText | null
  startingPrice: number
  currency: string
  billingCycles: BillingCycle[]
  features: LocalizedText[] | null
  benefits: LocalizedText[] | null
  howItWorks: LocalizedText[] | null
  suitableFor: LocalizedText[] | null
  faqs: Product['faqs'] | null
  rating: number
  reviewCount: number
  isFeatured: boolean
  statusId: number
  packages: Product['packages']
  relatedProductIds: string[]
  createdDate: string
  modifiedDate: string | null
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const EMPTY_TEXT: LocalizedText = { vi: '', en: '' }

function mapBackendProduct(raw: BackendProduct): Product {
  return {
    id: raw.id,
    slug: raw.slug,
    category: raw.category.code as ProductCategory,
    subCategory: raw.subCategory,
    name: raw.name,
    shortDescription: raw.shortDescription ?? EMPTY_TEXT,
    description: raw.description ?? EMPTY_TEXT,
    icon: raw.icon ?? '',
    badge: raw.badge ?? undefined,
    startingPrice: raw.startingPrice,
    currency: 'VND',
    billingCycles: raw.billingCycles,
    features: raw.features ?? [],
    benefits: raw.benefits ?? [],
    howItWorks: raw.howItWorks ?? [],
    suitableFor: raw.suitableFor ?? [],
    faqs: raw.faqs ?? [],
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    isFeatured: raw.isFeatured,
    isActive: true, // public/admin endpoints already filter out non-active except getAllForAdmin below
    packages: raw.packages ?? [],
    relatedProductIds: raw.relatedProductIds ?? [],
    createdAt: raw.createdDate,
    updatedAt: raw.modifiedDate ?? raw.createdDate,
  }
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const result = await apiGet<PaginatedResult<BackendProduct>>(
      '/products',
      filters as Record<string, unknown>,
    )
    return result.items.map(mapBackendProduct)
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const raw = await apiGet<BackendProduct>(`/products/${encodeURIComponent(slug)}`)
      return mapBackendProduct(raw)
    } catch {
      return null
    }
  },

  async getFeaturedProducts(limit = 6): Promise<Product[]> {
    const raw = await apiGet<BackendProduct[]>('/products/featured', { limit })
    return raw.map(mapBackendProduct)
  },

  async getRelatedProducts(product: Product): Promise<Product[]> {
    const raw = await apiGet<BackendProduct[]>(`/products/${encodeURIComponent(product.slug)}/related`)
    return raw.map(mapBackendProduct)
  },

  async getAllForAdmin(): Promise<Product[]> {
    const raw = await apiGet<BackendProduct[]>('/admin/products')
    return raw.map((p) => ({ ...mapBackendProduct(p), isActive: p.statusId === 1 }))
  },

  async createProduct(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const raw = await apiPost<BackendProduct>('/admin/products', {
      category: input.category,
      subCategory: input.subCategory,
      slug: input.slug,
      name: input.name,
      shortDescription: input.shortDescription,
      description: input.description,
      icon: input.icon,
      badge: input.badge,
      startingPrice: input.startingPrice,
      billingCycles: input.billingCycles,
      features: input.features,
      benefits: input.benefits,
      howItWorks: input.howItWorks,
      suitableFor: input.suitableFor,
      faqs: input.faqs,
      isFeatured: input.isFeatured,
      packages: input.packages,
      relatedProductIds: input.relatedProductIds,
    })
    return mapBackendProduct(raw)
  },

  async updateProduct(id: string, input: Partial<Product>): Promise<Product> {
    const raw = await apiPatch<BackendProduct>(`/admin/products/${id}`, input)
    return mapBackendProduct(raw)
  },

  async deleteProduct(id: string): Promise<void> {
    await apiDelete(`/admin/products/${id}`)
  },
}
