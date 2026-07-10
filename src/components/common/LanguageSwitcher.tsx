import { useTranslation } from 'react-i18next'
import { STORAGE_KEYS } from '@/constants/config'
import { cn } from '@/utils/cn'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation()

  function switchLanguage(lng: 'vi' | 'en') {
    i18n.changeLanguage(lng)
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lng)
    document.documentElement.lang = lng
  }

  return (
    <div
      className={cn(
        'flex items-center rounded-lg border border-border p-0.5 text-xs font-semibold',
        className,
      )}
    >
      <button
        onClick={() => switchLanguage('vi')}
        aria-pressed={i18n.language === 'vi'}
        className={cn(
          'rounded-md px-2 py-1 transition-colors',
          i18n.language === 'vi'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:text-text-primary',
        )}
      >
        VI
      </button>
      <button
        onClick={() => switchLanguage('en')}
        aria-pressed={i18n.language === 'en'}
        className={cn(
          'rounded-md px-2 py-1 transition-colors',
          i18n.language === 'en'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:text-text-primary',
        )}
      >
        EN
      </button>
    </div>
  )
}
