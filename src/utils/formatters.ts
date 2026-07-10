import type { Locale } from '@/types'

export function formatCurrency(amount: number, locale: Locale = 'vi'): string {
  if (locale === 'en') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string, locale: Locale = 'vi'): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(dateString: string, locale: Locale = 'vi'): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function maskLicenseKey(key: string): string {
  const parts = key.split('-')
  return parts.map((p, i) => (i === parts.length - 1 ? p : '*'.repeat(p.length))).join('-')
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return email
  const visible = name.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`
}
