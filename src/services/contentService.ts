import type { Banner, ContactSubmission, Faq, SupportArticle, Testimonial } from '@/types'
import { mockFaqs } from '@/data/mocks/faqs'
import { mockTestimonials } from '@/data/mocks/testimonials'
import { mockSupportArticles } from '@/data/mocks/supportArticles'
import { mockBanners } from '@/data/mocks/banners'
import { mockEsimDevices, type EsimDevice } from '@/data/mocks/esimDevices'
import { mockPartners, type Partner } from '@/data/mocks/partners'
import { STORAGE_KEYS } from '@/constants/config'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { generateId } from '@/utils/generators'

const contactRepo = createRepository<ContactSubmission>(STORAGE_KEYS.CONTACT_SUBMISSIONS, [])

export const contentService = {
  async getFaqs(group?: Faq['group']): Promise<Faq[]> {
    await delay()
    return group ? mockFaqs.filter((f) => f.group === group) : mockFaqs
  },

  async getTestimonials(): Promise<Testimonial[]> {
    await delay()
    return mockTestimonials
  },

  async getPartners(): Promise<Partner[]> {
    await delay(150, 300)
    return mockPartners
  },

  async getBanners(): Promise<Banner[]> {
    await delay()
    return mockBanners
  },

  async getSupportArticles(category?: SupportArticle['category']): Promise<SupportArticle[]> {
    await delay()
    return category
      ? mockSupportArticles.filter((a) => a.category === category)
      : mockSupportArticles
  },

  async getSupportArticleBySlug(slug: string): Promise<SupportArticle | null> {
    await delay()
    return mockSupportArticles.find((a) => a.slug === slug) ?? null
  },

  async getEsimDevices(): Promise<EsimDevice[]> {
    await delay()
    return mockEsimDevices
  },

  async submitContactForm(
    input: Omit<ContactSubmission, 'id' | 'createdAt'>,
  ): Promise<ContactSubmission> {
    await delay(400, 700)
    const submission: ContactSubmission = {
      ...input,
      id: generateId('contact'),
      createdAt: new Date().toISOString(),
    }
    contactRepo.saveAll([submission, ...contactRepo.getAll()])
    return submission
  },
}
