import { useTranslation } from 'react-i18next'
import { STORAGE_KEYS } from '@/constants/config'
import { cn } from '@/utils/cn'

interface LanguageSwitcherProps {
  className?: string
  /** 'dark' renders the pill for a dark/navy surface (e.g. the auth header). */
  tone?: 'light' | 'dark'
}

export function LanguageSwitcher({ className, tone = 'light' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()

  function switchLanguage(lng: 'vi' | 'en') {
    i18n.changeLanguage(lng)
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lng)
    document.documentElement.lang = lng
  }

  const inactiveClass =
    tone === 'dark' ? 'text-white/60 hover:text-white' : 'text-text-secondary hover:text-text-primary'

  return (
    <div
      className={cn(
        'flex items-center rounded-lg border p-0.5 text-xs font-semibold',
        tone === 'dark' ? 'border-white/15' : 'border-border',
        className,
      )}
    >
      <button
        onClick={() => switchLanguage('vi')}
        aria-pressed={i18n.language === 'vi'}
        className={cn(
          'rounded-md px-2 py-1 transition-colors',
          i18n.language === 'vi' ? 'bg-primary text-white' : inactiveClass,
        )}
      >
        VI
      </button>
      <button
        onClick={() => switchLanguage('en')}
        aria-pressed={i18n.language === 'en'}
        className={cn(
          'rounded-md px-2 py-1 transition-colors',
          i18n.language === 'en' ? 'bg-primary text-white' : inactiveClass,
        )}
      >
        EN
      </button>
    </div>
  )
}
