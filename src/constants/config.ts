export const BRAND_NAME = 'VTC TELECOM'

/**
 * Bump this whenever seed/mock data changes shape or content in a way that should
 * override what's already cached in localStorage (see src/services/repository.ts).
 * Without this, browsers that already seeded old data would never see updated mock data.
 */
export const SEED_VERSION = '2026-07-10.1'

export const DEMO_ACCOUNTS = {
  // Customer login still runs against the local mock repo (backend has no
  // register/customer-auth endpoints yet — see backend integration notes).
  customer: { email: 'customer@vtctelecom.vn', password: '123456' },
  // Admin login now calls the real backend; this must match the seeded
  // admin account in backend/scripts/run_seed.js.
  admin: { email: 'admin@digital-platform.local', password: 'Admin@123' },
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
  ACCESS_TOKEN: 'novadigital_access_token',
  REFRESH_TOKEN: 'novadigital_refresh_token',
}

export const MOCK_BANK_TRANSFER = {
  bankName: 'Vietcombank (Demo)',
  accountName: 'CONG TY TNHH VTC TELECOM',
  accountNumber: '0123456789',
}
