import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, UserPlus } from 'lucide-react'
import { Drawer } from '@/components/common/Drawer'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { Button } from '@/components/common/Button'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import { MEGA_MENU_GROUPS } from '@/constants/nav'

const LINKS = [
  { to: ROUTES.HOME, key: 'nav.home' },
  { to: ROUTES.PRODUCTS, key: 'nav.products' },
  { to: ROUTES.SOLUTIONS, key: 'nav.solutions' },
  { to: ROUTES.PRICING, key: 'nav.pricing' },
  { to: ROUTES.SUPPORT, key: 'nav.support' },
  { to: ROUTES.ABOUT, key: 'nav.about' },
  { to: ROUTES.CONTACT, key: 'nav.contact' },
]

export function MobileNav() {
  const { t } = useTranslation()
  const isOpen = useUiStore((s) => s.isMobileMenuOpen)
  const closeMobileMenu = useUiStore((s) => s.closeMobileMenu)
  const currentUser = useAuthStore((s) => s.currentUser)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeMobileMenu}
      side="left"
      title={<img src="/VTC_Logo.png" alt="VTC Telecom" className="h-6 w-auto object-contain" />}
      widthClassName="max-w-xs"
    >
      <div className="flex flex-col gap-1 p-4">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={closeMobileMenu}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-surface"
          >
            {t(link.key)}
          </Link>
        ))}

        <div className="mt-2 border-t border-border pt-3">
          {MEGA_MENU_GROUPS.map((group) => (
            <div key={group.titleKey} className="mb-3">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {t(group.titleKey)}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.slug}
                  to={ROUTES.PRODUCT_DETAIL(item.slug)}
                  onClick={closeMobileMenu}
                  className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <LanguageSwitcher />
        </div>

        {!currentUser && (
          <div className="mt-3 flex flex-col gap-2">
            <Link to={ROUTES.LOGIN} onClick={closeMobileMenu}>
              <Button variant="outline" className="w-full" leftIcon={<LogIn className="size-4" />}>
                {t('nav.login')}
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER} onClick={closeMobileMenu}>
              <Button className="w-full" leftIcon={<UserPlus className="size-4" />}>
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  )
}
