import { useTranslation } from 'react-i18next'
import type { Locale } from '@/types'

export function useLocale(): Locale {
  const { i18n } = useTranslation()
  return i18n.language === 'en' ? 'en' : 'vi'
}
