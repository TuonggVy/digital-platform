import { Link } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { ROUTES } from '@/constants/routes'

export function BrandHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
      <Link to={ROUTES.HOME} className="inline-flex items-center">
        <img src="/VTC_Logo.png" alt="VTC Telecom" className="h-7 w-auto object-contain" />
      </Link>
      <LanguageSwitcher tone="dark" />
    </header>
  )
}
