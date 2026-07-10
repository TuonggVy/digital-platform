import type { LocalizedText } from './common'

export type ProductCategory = 'cloud' | 'kaspersky' | 'esim'

export type BillingCycle = 'monthly' | 'yearly' | 'one_time'

export type CloudSubCategory =
  'cloud-server' | 'kubernetes' | 'cloud-storage' | 'cloud-backup' | 'load-balancer'

export type KasperskySubCategory = 'standard' | 'plus' | 'premium' | 'small-office'

export type EsimRegionKey = 'asia' | 'europe' | 'north-america' | 'global'

export type KasperskyUserType = 'personal' | 'family' | 'business'

export interface CloudSpec {
  regions: string[]
  cpu: string
  ram: string
  ssd: string
  bandwidth: string
  os: string[]
}

export interface KasperskySpec {
  devices: number
  duration: string
  userType: KasperskyUserType
  supportedOS: string[]
}

export interface EsimSpec {
  country: LocalizedText
  countryCode: string
  region: EsimRegionKey
  dataAmount: string
  isUnlimited: boolean
  days: number
  hotspot: boolean
  networkType: '4G' | '4G/5G'
  coveredCountries?: number
}

export interface ProductPackage {
  id: string
  name: LocalizedText
  price: number
  billingCycle: BillingCycle
  isPopular?: boolean
  cloud?: CloudSpec
  kaspersky?: KasperskySpec
  esim?: EsimSpec
}

export interface ProductFaq {
  question: LocalizedText
  answer: LocalizedText
}

export interface Product {
  id: string
  slug: string
  category: ProductCategory
  subCategory: string
  name: LocalizedText
  shortDescription: LocalizedText
  description: LocalizedText
  icon: string
  badge?: LocalizedText
  startingPrice: number
  currency: 'VND'
  billingCycles: BillingCycle[]
  features: LocalizedText[]
  benefits: LocalizedText[]
  howItWorks: LocalizedText[]
  suitableFor: LocalizedText[]
  faqs: ProductFaq[]
  rating: number
  reviewCount: number
  isFeatured: boolean
  isActive: boolean
  packages: ProductPackage[]
  relatedProductIds: string[]
  createdAt: string
  updatedAt: string
}
