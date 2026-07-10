import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, MoreVertical, Settings, UserCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { Dropdown, DropdownItem } from '@/components/common/Dropdown'
import { cn } from '@/utils/cn'
import { SidebarTooltip } from './SidebarTooltip'

interface AdminSidebarUserProps {
  collapsed: boolean
}

export function AdminSidebarUser({ collapsed }: AdminSidebarUserProps) {
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const showToast = useUiStore((s) => s.showToast)
  const anchorRef = useRef<HTMLDivElement>(null)

  const name = currentUser?.name ?? 'Admin'
  const email = currentUser?.email ?? 'admin@vtctelecom.vn'
  const initial = name.charAt(0).toUpperCase()

  function handleComingSoon() {
    showToast(t('admin.sidebar.comingSoon'), 'info')
  }

  return (
    <div className="border-t border-border p-3">
      <div ref={anchorRef} className="relative">
        <Dropdown
          placement="top"
          align="left"
          className="w-64"
          trigger={
            <span
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-surface focus-ring',
                collapsed && 'justify-center',
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initial}
              </span>
              <span className={cn('min-w-0 flex-1', collapsed && 'sr-only')}>
                <span className="block truncate text-sm font-medium text-text-primary">{name}</span>
                <span className="block truncate text-xs text-text-secondary">{email}</span>
              </span>
              {!collapsed && (
                <MoreVertical aria-hidden="true" className="size-4 shrink-0 text-text-secondary" />
              )}
            </span>
          }
        >
          <div className="border-b border-border px-3 pb-2 pt-1">
            <p className="truncate text-sm font-medium text-text-primary">{name}</p>
            <p className="truncate text-xs text-text-secondary">{email}</p>
          </div>
          <div className="pt-1">
            <DropdownItem onClick={handleComingSoon}>
              <UserCircle aria-hidden="true" className="size-4" />
              {t('admin.sidebar.profile')}
            </DropdownItem>
            <DropdownItem onClick={handleComingSoon}>
              <Settings aria-hidden="true" className="size-4" />
              {t('admin.sidebar.settings')}
            </DropdownItem>
            <DropdownItem onClick={logout} className="text-red-500">
              <LogOut aria-hidden="true" className="size-4" />
              {t('admin.sidebar.logout')}
            </DropdownItem>
          </div>
        </Dropdown>

        <SidebarTooltip anchorRef={anchorRef} label={`${name} · ${email}`} enabled={collapsed} />
      </div>
    </div>
  )
}
