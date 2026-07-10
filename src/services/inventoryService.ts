import { mockLicenseStock, type LicenseStockItem } from '@/data/mocks/licenses'
import { mockEsimStock, type EsimStockItem } from '@/data/mocks/esimInventory'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { generateId } from '@/utils/generators'

const licenseRepo = createRepository<LicenseStockItem>(
  'novadigital_license_stock',
  mockLicenseStock,
)
const esimRepo = createRepository<EsimStockItem>('novadigital_esim_stock', mockEsimStock)

export const inventoryService = {
  async getLicenses(): Promise<LicenseStockItem[]> {
    await delay()
    return licenseRepo.getAll()
  },

  async addLicense(input: Omit<LicenseStockItem, 'id' | 'status'>): Promise<LicenseStockItem> {
    await delay()
    const item: LicenseStockItem = { ...input, id: generateId('lic'), status: 'AVAILABLE' }
    licenseRepo.saveAll([item, ...licenseRepo.getAll()])
    return item
  },

  async getEsimStock(): Promise<EsimStockItem[]> {
    await delay()
    return esimRepo.getAll()
  },

  async addEsimStock(input: Omit<EsimStockItem, 'id' | 'status'>): Promise<EsimStockItem> {
    await delay()
    const item: EsimStockItem = { ...input, id: generateId('esim-stock'), status: 'AVAILABLE' }
    esimRepo.saveAll([item, ...esimRepo.getAll()])
    return item
  },
}
