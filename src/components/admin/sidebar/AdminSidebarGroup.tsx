import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { AdminSidebarItem } from './AdminSidebarItem'
import type { SidebarGroup } from './adminSidebar.config'

interface AdminSidebarGroupProps {
  group: SidebarGroup
  collapsed: boolean
  isFirst: boolean
  onNavigate?: () => void
}

export function AdminSidebarGroup({ group, collapsed, isFirst, onNavigate }: AdminSidebarGroupProps) {
  const { t } = useTranslation()

  return (
    <div className={cn(!isFirst && (collapsed ? 'mt-2 border-t border-border pt-2' : 'mt-1'))}>
      {!collapsed && (
        <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/70">
          {t(group.label)}
        </p>
      )}
      <ul className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <AdminSidebarItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  )
}
