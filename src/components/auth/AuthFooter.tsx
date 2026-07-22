import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'

export function AuthFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 flex flex-col items-center gap-2 px-4 py-6 text-xs text-white/40 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
      <p>
        © {year} VTC TELECOM. {t('footer.rights')}
      </p>
      <div className="flex items-center gap-4">
        <Link to={ROUTES.TERMS} className="hover:text-white/70">
          {t('legal.termsTitle')}
        </Link>
        <Link to={ROUTES.PRIVACY} className="hover:text-white/70">
          {t('legal.privacyTitle')}
        </Link>
      </div>
    </footer>
  )
}
