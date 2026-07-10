export type EsimStockStatus = 'AVAILABLE' | 'ASSIGNED' | 'USED'

export interface EsimStockItem {
  id: string
  code: string
  productId: string
  country: string
  dataAmount: string
  days: number
  status: EsimStockStatus
  assignedOrderCode?: string
}

export const mockEsimStock: EsimStockItem[] = [
  {
    id: 'esim-stock-001',
    code: 'ESIM-JP-88213',
    productId: 'esim-japan-5gb',
    country: 'Nhật Bản',
    dataAmount: '5 GB',
    days: 7,
    status: 'ASSIGNED',
    assignedOrderCode: 'ND10250033456',
  },
  {
    id: 'esim-stock-002',
    code: 'ESIM-EU-44120',
    productId: 'esim-europe',
    country: 'Châu Âu',
    dataAmount: '20 GB',
    days: 30,
    status: 'USED',
    assignedOrderCode: 'ND10250055678',
  },
  {
    id: 'esim-stock-003',
    code: 'ESIM-KR-77341',
    productId: 'esim-korea-unlimited',
    country: 'Hàn Quốc',
    dataAmount: 'Không giới hạn',
    days: 5,
    status: 'AVAILABLE',
  },
  {
    id: 'esim-stock-004',
    code: 'ESIM-GLB-10056',
    productId: 'esim-global',
    country: 'Toàn cầu',
    dataAmount: '20 GB',
    days: 30,
    status: 'AVAILABLE',
  },
  {
    id: 'esim-stock-005',
    code: 'ESIM-US-99871',
    productId: 'esim-usa-unlimited',
    country: 'Hoa Kỳ',
    dataAmount: 'Không giới hạn',
    days: 10,
    status: 'AVAILABLE',
  },
]
