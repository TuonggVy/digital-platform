import { useEffect, useRef, useState, type FocusEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
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
  const headerRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const isHomePage = location.pathname === ROUTES.HOME
  const [isOverHomeHero, setIsOverHomeHero] = useState(false)
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false)
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const openCartDrawer = useUiStore((s) => s.openCartDrawer)
  const toggleMobileMenu = useUiStore((s) => s.toggleMobileMenu)

  // Theme switch is driven by the real position of Product Lineup (marked via
  // `[data-home-navbar-solid-start]`), not a fixed scrollY/viewport-height threshold — so it keeps
  // tracking correctly even if the Hero's own shrink/timeline effect changes size or timing.
  useEffect(() => {
    let rafId: number | null = null
    let mountRaf1: number | null = null
    let mountRaf2: number | null = null

    function updateNavbarTheme() {
      if (!isHomePage) {
        setIsOverHomeHero(false)
        return
      }

      const solidStart = document.querySelector<HTMLElement>('[data-home-navbar-solid-start]')

      if (!solidStart) {
        // Home vừa mount hoặc đang route-transition. Giữ navbar transparent ở đầu Home.
        setIsOverHomeHero(window.scrollY <= 8)
        return
      }

      const headerHeight = headerRef.current?.offsetHeight ?? 72
      const switchOffset = 8
      const productTop = solidStart.getBoundingClientRect().top

      setIsOverHomeHero(productTop > headerHeight + switchOffset)
    }

    function scheduleUpdate() {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        updateNavbarTheme()
      })
    }

    updateNavbarTheme()

    // ProductScrollHero có thể mount sau Header trong cùng route transition.
    mountRaf1 = requestAnimationFrame(() => {
      updateNavbarTheme()
      mountRaf2 = requestAnimationFrame(updateNavbarTheme)
    })

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (mountRaf1 !== null) cancelAnimationFrame(mountRaf1)
      if (mountRaf2 !== null) cancelAnimationFrame(mountRaf2)
    }
  }, [isHomePage])

  function handleProductsBlur(e: FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsProductsMenuOpen(false)
    }
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-[200] overflow-visible',
        'transition-[background-color,border-color,box-shadow,color,backdrop-filter] duration-300 ease-out',
        isOverHomeHero
          ? 'border-b border-transparent bg-transparent text-white shadow-none backdrop-blur-none'
          : 'border-b border-border bg-background/95 text-text-primary shadow-sm backdrop-blur-lg',
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 overflow-visible px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center">
          <img src="/VTC_Logo.png" alt="VTC Telecom" className="h-9 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-1 overflow-visible lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setIsProductsMenuOpen(true)}
            onMouseLeave={() => setIsProductsMenuOpen(false)}
            onFocus={() => setIsProductsMenuOpen(true)}
            onBlur={handleProductsBlur}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={isProductsMenuOpen}
              onClick={() => setIsProductsMenuOpen((v) => !v)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 focus-ring',
                isOverHomeHero ? 'text-white/78 hover:text-white' : 'text-text-secondary hover:text-text-primary',
              )}
            >
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
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 focus-ring',
                  isActive
                    ? isOverHomeHero
                      ? 'text-white'
                      : 'text-primary'
                    : isOverHomeHero
                      ? 'text-white/78 hover:text-white'
                      : 'text-text-secondary hover:text-text-primary',
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
            className={cn(
              'hidden rounded-lg p-2 transition-colors duration-300 sm:flex focus-ring',
              isOverHomeHero ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-text-secondary hover:bg-surface',
            )}
          >
            <Search className="size-5" />
          </Link>
          <LanguageSwitcher className="hidden sm:flex" tone={isOverHomeHero ? 'dark' : 'light'} />
          <button
            onClick={openCartDrawer}
            aria-label={t('nav.cart')}
            className={cn(
              'relative rounded-lg p-2 transition-colors duration-300 focus-ring',
              isOverHomeHero ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-text-secondary hover:bg-surface',
            )}
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
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full transition-colors duration-300 focus-ring',
                    isOverHomeHero ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary',
                  )}
                >
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
                <Button
                  variant="ghost"
                  size="sm"
                  style={isOverHomeHero ? { color: 'rgba(255,255,255,0.9)' } : undefined}
                >
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
            className={cn(
              'rounded-lg p-2 transition-colors duration-300 lg:hidden focus-ring',
              isOverHomeHero ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-text-secondary hover:bg-surface',
            )}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
