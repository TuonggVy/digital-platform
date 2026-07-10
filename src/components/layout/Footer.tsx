import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AtSign, MessageCircle, Share2 } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Newsletter } from '@/components/common/Newsletter'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#060b17] text-white">
      <div className="absolute inset-0 -z-10 bg-grid opacity-10" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center">
              <img src="/VTC_Logo.png" alt="VTC Telecom" className="h-9 w-auto object-contain" />
            </Link>
            <p className="mt-3 max-w-sm text-sm text-slate-400">{t('footer.description')}</p>
            <div className="mt-4 flex gap-3">
              {[Share2, MessageCircle, AtSign].map((Icon, idx) => (
                <span
                  key={idx}
                  className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.products')}</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              <li>
                <Link to={ROUTES.PRODUCTS_CLOUD} className="hover:text-primary">
                  {t('nav.megamenu.cloud')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRODUCTS_KASPERSKY} className="hover:text-primary">
                  {t('nav.megamenu.kaspersky')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRODUCTS_ESIM} className="hover:text-primary">
                  {t('nav.megamenu.esim')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRICING} className="hover:text-primary">
                  {t('nav.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.company')}</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              <li>
                <Link to={ROUTES.ABOUT} className="hover:text-primary">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SOLUTIONS} className="hover:text-primary">
                  {t('nav.solutions')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-primary">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SUPPORT} className="hover:text-primary">
                  {t('footer.support')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.legal')}</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              <li>
                <Link to={ROUTES.TERMS} className="hover:text-primary">
                  {t('legal.termsTitle')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRIVACY} className="hover:text-primary">
                  {t('legal.privacyTitle')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ESIM_DEVICES} className="hover:text-primary">
                  {t('esimDevicesPage.title')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <Newsletter />
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} VTC TELECOM. {t('footer.rights')}
          </p>
          <p>{t('footer.demoNotice')}</p>
        </div>
      </div>
    </footer>
  )
}
