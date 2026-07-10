import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import { Drawer } from '@/components/common/Drawer'
import { ADMIN_MENU_GROUPS } from './sidebar/adminSidebar.config'
import { AdminSidebarGroup } from './sidebar/AdminSidebarGroup'
import { AdminSidebarUser } from './sidebar/AdminSidebarUser'

const STORAGE_KEY = 'admin-sidebar-collapsed'

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

interface AdminSidebarProps {
  /** Mobile drawer visibility — toggled from a hamburger button in AdminHeader. */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  function renderBrand(isCollapsed: boolean) {
    if (isCollapsed) {
      return (
        <button
          type="button"
          aria-label={t('admin.sidebar.expand')}
          onClick={() => setCollapsed(false)}
          className="flex h-9 w-12 cursor-pointer items-center justify-center rounded-lg focus-ring"
        >
          <img
            src="/VTC_Logo.png"
            alt={t('admin.sidebar.brand')}
            className="h-full w-full object-contain"
          />
        </button>
      )
    }

    return (
      <Link to={ROUTES.ADMIN} className="flex h-9 min-w-0 cursor-pointer items-center">
        <img
          src="/VTC_Logo.png"
          alt={t('admin.sidebar.brand')}
          className="h-full w-auto max-w-[160px] object-contain object-left"
        />
      </Link>
    )
  }

  function renderNav(navCollapsed: boolean, onNavigate?: () => void) {
    return (
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {ADMIN_MENU_GROUPS.map((group, idx) => (
          <AdminSidebarGroup
            key={group.key}
            group={group}
            collapsed={navCollapsed}
            isFirst={idx === 0}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    )
  }

  return (
    <>
      {/* Desktop: in-flow flex sidebar, own width drives the layout gap in AdminLayout */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background transition-[width] duration-300 ease-in-out lg:flex',
          collapsed ? 'w-20' : 'w-[272px]',
        )}
      >
        <div className={cn('flex h-16 shrink-0 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
          {renderBrand(collapsed)}
          {!collapsed && (
            <button
              type="button"
              aria-label={t('admin.sidebar.collapse')}
              onClick={() => setCollapsed(true)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus-ring"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        {renderNav(collapsed)}

        <AdminSidebarUser collapsed={collapsed} />
      </aside>

      {/* Mobile: reuses the shared Drawer (overlay, Escape-to-close, scroll lock, slide-in already built in) */}
      <Drawer isOpen={mobileOpen} onClose={() => onMobileClose?.()} side="left" widthClassName="max-w-[288px]">
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-4 py-4">{renderBrand(false)}</div>
          {renderNav(false, onMobileClose)}
          <AdminSidebarUser collapsed={false} />
        </div>
      </Drawer>
    </>
  )
}
