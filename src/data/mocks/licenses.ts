export type LicenseStatus = 'AVAILABLE' | 'ASSIGNED' | 'EXPIRED'

export interface LicenseStockItem {
  id: string
  key: string
  productId: string
  productName: string
  duration: string
  status: LicenseStatus
  assignedOrderCode?: string
  expiryDate: string
}

export const mockLicenseStock: LicenseStockItem[] = [
  {
    id: 'lic-001',
    key: 'PLUS5-9F2K-7XQ1-M4RT-2025',
    productId: 'kaspersky-plus',
    productName: 'Kaspersky Plus',
    duration: '1 năm',
    status: 'ASSIGNED',
    assignedOrderCode: 'ND10250022345',
    expiryDate: '2026-06-15T00:00:00.000Z',
  },
  {
    id: 'lic-002',
    key: 'STD1-4H7L-2WZ9-B1CD-2025',
    productId: 'kaspersky-standard',
    productName: 'Kaspersky Standard',
    duration: '1 năm',
    status: 'ASSIGNED',
    assignedOrderCode: 'ND10250055678',
    expiryDate: '2026-07-22T00:00:00.000Z',
  },
  {
    id: 'lic-003',
    key: 'PREM5-3J8N-6YV2-K9LP-2025',
    productId: 'kaspersky-premium',
    productName: 'Kaspersky Premium',
    duration: '1 năm',
    status: 'AVAILABLE',
    expiryDate: '2027-01-01T00:00:00.000Z',
  },
  {
    id: 'lic-004',
    key: 'SOHO10-1A5S-8DF3-QW7E-2025',
    productId: 'kaspersky-small-office-security',
    productName: 'Kaspersky Small Office Security',
    duration: '1 năm',
    status: 'AVAILABLE',
    expiryDate: '2027-01-01T00:00:00.000Z',
  },
  {
    id: 'lic-005',
    key: 'STD3-2K9M-5RT8-N3XC-2024',
    productId: 'kaspersky-standard',
    productName: 'Kaspersky Standard',
    duration: '1 năm',
    status: 'EXPIRED',
    expiryDate: '2025-01-01T00:00:00.000Z',
  },
]
