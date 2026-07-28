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
    // No overflow-hidden here — the account menu opens upward (placement="top") past this
    // wrapper's own box, and overflow-hidden would clip it since it renders outside these
    // bounds. The sidebar-width overflow this div used to guard against is instead prevented
    // by the trigger's own fixed width below, so no clipping ancestor is needed.
    <div className="relative z-[130] w-full min-w-0 shrink-0 p-3 pt-5">
      <div ref={anchorRef} className="relative min-w-0">
        <Dropdown
          placement="top"
          align="left"
          className="w-64"
          trigger={
            <span
              className={cn(
                // Dropdown's trigger <button> is a plain inline-block (shrink-to-fit) with no
                // width of its own — a `w-full`/percentage child can't resolve against that when
                // the row contains an unbreakable token (the email), so it silently overflows the
                // sidebar. A fixed pixel width (matching the 232px sidebar minus this row's own
                // padding) gives the shrink-to-fit button a definite size to fit instead, letting
                // `truncate` below actually activate.
                'flex items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-black/[0.03] focus-ring',
                collapsed ? 'w-full justify-center' : 'w-[208px]',
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-admin-primary-soft text-sm font-semibold text-admin-primary">
                {initial}
              </span>
              <span className={cn('min-w-0 flex-1', collapsed && 'sr-only')}>
                <span className="block truncate text-sm font-medium text-admin-text">{name}</span>
                <span className="block truncate text-xs text-admin-text-muted">{email}</span>
              </span>
              {!collapsed && (
                <MoreVertical aria-hidden="true" className="size-4 shrink-0 text-admin-text-muted" />
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
