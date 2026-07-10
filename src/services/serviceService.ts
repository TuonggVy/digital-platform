import type { CloudService, CustomerService, EsimService, KasperskyService, Order } from '@/types'
import { mockServices } from '@/data/mocks/services'
import { STORAGE_KEYS } from '@/constants/config'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { generateId } from '@/utils/generators'
import { allProducts } from '@/data/mocks/products'

const repo = createRepository<CustomerService>(STORAGE_KEYS.SERVICES, mockServices)

function randomIp(): string {
  return `103.145.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function randomLicenseKey(): string {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `LIC-${seg()}-${seg()}-${seg()}-2025`
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export const serviceService = {
  async getServicesByUser(userId: string): Promise<CustomerService[]> {
    await delay()
    return repo.getAll().filter((s) => s.userId === userId)
  },

  async getServiceById(id: string): Promise<CustomerService | null> {
    await delay()
    return repo.getAll().find((s) => s.id === id) ?? null
  },

  async getAllForAdmin(): Promise<CustomerService[]> {
    await delay()
    return repo.getAll()
  },

  async createServicesFromOrder(order: Order): Promise<CustomerService[]> {
    await delay(200, 400)
    const now = new Date()
    const created: CustomerService[] = order.items.map((item) => {
      const base = {
        id: generateId('svc'),
        userId: order.userId,
        orderId: order.id,
        orderCode: order.orderCode,
        productId: item.productId,
        productName: item.productName,
        packageName: item.packageName,
        status: 'PENDING_ACTIVATION' as const,
        startDate: now.toISOString(),
        createdAt: now.toISOString(),
      }

      const product = allProducts.find((p) => p.id === item.productId)
      const pkg = product?.packages.find((p) => p.id === item.packageId)

      if (item.category === 'cloud') {
        const expiry = item.billingCycle === 'yearly' ? addYears(now, 1) : addDays(now, 30)
        const cloudService: CloudService = {
          ...base,
          type: 'cloud',
          ip: randomIp(),
          cpu: pkg?.cloud?.cpu ?? '-',
          ram: pkg?.cloud?.ram ?? '-',
          ssd: pkg?.cloud?.ssd ?? '-',
          region: pkg?.cloud?.regions[0] ?? 'Singapore',
          expiryDate: expiry.toISOString(),
        }
        return cloudService
      }

      if (item.category === 'kaspersky') {
        const expiry = addYears(now, 1)
        const kasperskyService: KasperskyService = {
          ...base,
          type: 'kaspersky',
          licenseKey: randomLicenseKey(),
          devices: pkg?.kaspersky?.devices ?? 1,
          expiryDate: expiry.toISOString(),
        }
        return kasperskyService
      }

      const days = pkg?.esim?.days ?? 7
      const expiry = addDays(now, days)
      const esimService: EsimService = {
        ...base,
        type: 'esim',
        country: pkg?.esim ? pkg.esim.country.vi : '-',
        dataAmount: pkg?.esim?.dataAmount ?? '-',
        days,
        qrCodeData: `novadigital-esim-activation://${order.orderCode}/${item.productSlug}`,
        expiryDate: expiry.toISOString(),
      }
      return esimService
    })

    repo.saveAll([...created, ...repo.getAll()])
    return created
  },

  async renewService(id: string): Promise<CustomerService> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('SERVICE_NOT_FOUND')
    const service = all[index]
    const newExpiry =
      service.type === 'esim'
        ? addDays(new Date(), service.days)
        : addYears(new Date(service.expiryDate), 1)
    all[index] = { ...service, status: 'ACTIVE', expiryDate: newExpiry.toISOString() }
    repo.saveAll(all)
    return all[index]
  },
}
