export type ServiceStatus =
  'PENDING_ACTIVATION' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'SUSPENDED'

interface BaseService {
  id: string
  userId: string
  orderId: string
  orderCode: string
  productId: string
  productName: string
  packageName: string
  status: ServiceStatus
  startDate: string
  expiryDate: string
  createdAt: string
}

export interface CloudService extends BaseService {
  type: 'cloud'
  ip: string
  cpu: string
  ram: string
  ssd: string
  region: string
}

export interface KasperskyService extends BaseService {
  type: 'kaspersky'
  licenseKey: string
  devices: number
}

export interface EsimService extends BaseService {
  type: 'esim'
  country: string
  dataAmount: string
  days: number
  qrCodeData: string
}

export type CustomerService = CloudService | KasperskyService | EsimService
