export const BRAND_NAME = 'VTC TELECOM'

/**
 * Bump this whenever seed/mock data changes shape or content in a way that should
 * override what's already cached in localStorage (see src/services/repository.ts).
 * Without this, browsers that already seeded old data would never see updated mock data.
 */
export const SEED_VERSION = '2026-07-10.1'

export const DEMO_ACCOUNTS = {
  customer: { email: 'customer@vtctelecom.vn', password: '123456' },
  admin: { email: 'admin@vtctelecom.vn', password: '123456' },
}

export const STORAGE_KEYS = {
  AUTH: 'novadigital_auth',
  USERS: 'novadigital_users',
  CART: 'novadigital_cart',
  ORDERS: 'novadigital_orders',
  SERVICES: 'novadigital_services',
  TICKETS: 'novadigital_tickets',
  LANGUAGE: 'novadigital_language',
  CONTACT_SUBMISSIONS: 'novadigital_contact_submissions',
  PRODUCTS: 'novadigital_products',
}

export const MOCK_BANK_TRANSFER = {
  bankName: 'Vietcombank (Demo)',
  accountName: 'CONG TY TNHH VTC TELECOM',
  accountNumber: '0123456789',
}
