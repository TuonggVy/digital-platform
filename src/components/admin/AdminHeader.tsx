import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, ExternalLink, LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Dropdown, DropdownItem } from '@/components/common/Dropdown'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { ROUTES } from '@/constants/routes'

const NOTIFICATIONS = [
  { id: 1, text: 'Đơn hàng mới ND10250066789 vừa được thanh toán.' },
  { id: 2, text: 'License Kaspersky Standard sắp hết hạn trong kho.' },
  { id: 3, text: 'Ticket TK-0725003 đang chờ xử lý khẩn cấp.' },
]

interface AdminHeaderProps {
  mobileOpen?: boolean
  onMenuClick?: () => void
}

export function AdminHeader({ mobileOpen = false, onMenuClick }: AdminHeaderProps) {
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-lg sm:px-6">
      <button
        type="button"
        aria-label={t('admin.sidebar.openMenu')}
        aria-expanded={mobileOpen}
        onClick={onMenuClick}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface focus-ring lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to={ROUTES.HOME}
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface sm:flex"
        >
          <ExternalLink className="size-4" />
          {t('common.viewDetails')}
        </Link>
        <LanguageSwitcher className="hidden sm:flex" />

        <Dropdown
          trigger={
            <span className="relative flex size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface focus-ring">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                {NOTIFICATIONS.length}
              </span>
            </span>
          }
        >
          <p className="px-3 py-1.5 text-xs font-semibold uppercase text-text-secondary">
            Notifications
          </p>
          {NOTIFICATIONS.map((n) => (
            <DropdownItem key={n.id} className="whitespace-normal text-xs">
              {n.text}
            </DropdownItem>
          ))}
        </Dropdown>

        <Dropdown
          trigger={
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary focus-ring">
              {currentUser?.name.charAt(0)}
            </span>
          }
        >
          <div className="border-b border-border px-3 pb-2 pt-1">
            <p className="text-sm font-medium text-text-primary">{currentUser?.name}</p>
            <p className="text-xs text-text-secondary">{currentUser?.email}</p>
          </div>
          <div className="pt-1">
            <DropdownItem onClick={logout} className="text-red-500">
              <LogOut className="size-4" />
              {t('nav.logout')}
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  )
}
