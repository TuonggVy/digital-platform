import type { LocalizedText } from './common'

export interface Testimonial {
  id: string
  name: string
  role: LocalizedText
  avatar: string
  content: LocalizedText
  rating: number
}

export interface Faq {
  id: string
  group: 'general' | 'cloud' | 'kaspersky' | 'esim' | 'billing' | 'renewal'
  question: LocalizedText
  answer: LocalizedText
}

export interface Coupon {
  code: string
  type: 'percent' | 'fixed'
  value: number
  appliesToCategory?: 'cloud' | 'kaspersky' | 'esim'
  description: LocalizedText
}

export interface SupportArticle {
  id: string
  slug: string
  category: 'cloud' | 'kaspersky' | 'esim' | 'billing' | 'account'
  title: LocalizedText
  summary: LocalizedText
  content: LocalizedText[]
  readTimeMinutes: number
  relatedSlugs: string[]
  updatedAt: string
}

export interface Banner {
  id: string
  title: LocalizedText
  subtitle: LocalizedText
  isActive: boolean
}

export interface ContactSubmission {
  id: string
  fullName: string
  email: string
  phone: string
  company?: string
  subject: string
  message: string
  createdAt: string
}
