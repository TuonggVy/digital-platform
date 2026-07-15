import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import { Menu, Search, ShoppingCart, User } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { Button } from '@/components/common/Button'
import { Dropdown, DropdownItem } from '@/components/common/Dropdown'
import { MegaMenu } from './MegaMenu'
import { cn } from '@/utils/cn'

const NAV_LINKS = [
  { to: ROUTES.HOME, key: 'nav.home' },
  { to: ROUTES.SOLUTIONS, key: 'nav.solutions' },
  { to: ROUTES.PRICING, key: 'nav.pricing' },
  { to: ROUTES.SUPPORT, key: 'nav.support' },
  { to: ROUTES.ABOUT, key: 'nav.about' },
]

export function Header() {
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false)
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const openCartDrawer = useUiStore((s) => s.openCartDrawer)
  const toggleMobileMenu = useUiStore((s) => s.toggleMobileMenu)

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        isScrolled
          ? 'border-b border-border bg-background/85 shadow-sm backdrop-blur-lg'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center">
          <img src="/VTC_Logo.png" alt="VTC Telecom" className="h-9 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setIsProductsMenuOpen(true)}
            onMouseLeave={() => setIsProductsMenuOpen(false)}
          >
            <button className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary focus-ring">
              {t('nav.products')}
            </button>
            <AnimatePresence>{isProductsMenuOpen && <MegaMenu />}</AnimatePresence>
          </div>
          {NAV_LINKS.slice(1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium focus-ring',
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary',
                )
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <Link
            to={ROUTES.PRODUCTS}
            aria-label={t('common.search')}
            className="hidden rounded-lg p-2 text-text-secondary hover:bg-surface sm:flex focus-ring"
          >
            <Search className="size-5" />
          </Link>
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            onClick={openCartDrawer}
            aria-label={t('nav.cart')}
            className="relative rounded-lg p-2 text-text-secondary hover:bg-surface focus-ring"
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </button>

          {currentUser ? (
            <Dropdown
              trigger={
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary focus-ring">
                  <User className="size-4" />
                </span>
              }
            >
              <div className="border-b border-border px-3 pb-2 pt-1">
                <p className="text-sm font-medium text-text-primary">{currentUser.name}</p>
                <p className="text-xs text-text-secondary">{currentUser.email}</p>
              </div>
              <div className="pt-1">
                <Link to={currentUser.role === 'admin' ? ROUTES.ADMIN : ROUTES.ACCOUNT}>
                  <DropdownItem>
                    {currentUser.role === 'admin' ? t('nav.adminPanel') : t('nav.account')}
                  </DropdownItem>
                </Link>
                <DropdownItem onClick={logout}>{t('nav.logout')}</DropdownItem>
              </div>
            </Dropdown>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="sm" shine>
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </div>
          )}

          <button
            onClick={toggleMobileMenu}
            aria-label="Menu"
            className="rounded-lg p-2 text-text-secondary hover:bg-surface focus-ring lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
