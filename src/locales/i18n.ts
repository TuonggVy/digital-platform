import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { STORAGE_KEYS } from '@/constants/config'
import vi from './vi.json'
import en from './en.json'

const savedLanguage = (() => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'vi'
  } catch {
    return 'vi'
  }
})()

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
})

export default i18n
