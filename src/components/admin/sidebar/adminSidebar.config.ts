import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Server,
  KeyRound,
  Wifi,
  LifeBuoy,
  FileText,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export type SidebarBadgeVariant = 'default' | 'warning' | 'danger'

export interface SidebarItem {
  to: string
  key: string
  icon: LucideIcon
  end?: boolean
  badge?: number
  badgeVariant?: SidebarBadgeVariant
}

export interface SidebarGroup {
  key: string
  label: string
  items: SidebarItem[]
}

/**
 * Badge counts are mock/demo values (see task 15 in the project spec — no real API yet).
 * Wire these to real counts (pending orders, open tickets, expiring services) once the
 * corresponding services can provide them cheaply on every route change.
 */
export const ADMIN_MENU_GROUPS: SidebarGroup[] = [
  {
    key: 'overview',
    label: 'admin.sidebar.groups.overview',
    items: [{ to: ROUTES.ADMIN, key: 'admin.sidebar.dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    key: 'business',
    label: 'admin.sidebar.groups.business',
    items: [
      { to: ROUTES.ADMIN_PRODUCTS, key: 'admin.sidebar.products', icon: Package },
      { to: ROUTES.ADMIN_ORDERS, key: 'admin.sidebar.orders', icon: ShoppingBag, badge: 5 },
      { to: ROUTES.ADMIN_CUSTOMERS, key: 'admin.sidebar.customers', icon: Users },
    ],
  },
  {
    key: 'services',
    label: 'admin.sidebar.groups.services',
    items: [
      {
        to: ROUTES.ADMIN_SERVICES,
        key: 'admin.sidebar.services',
        icon: Server,
        badge: 2,
        badgeVariant: 'warning',
      },
      { to: ROUTES.ADMIN_LICENSES, key: 'admin.sidebar.licenses', icon: KeyRound },
      { to: ROUTES.ADMIN_ESIMS, key: 'admin.sidebar.esims', icon: Wifi },
    ],
  },
  {
    key: 'operation',
    label: 'admin.sidebar.groups.operation',
    items: [
      {
        to: ROUTES.ADMIN_TICKETS,
        key: 'admin.sidebar.tickets',
        icon: LifeBuoy,
        badge: 3,
        badgeVariant: 'danger',
      },
      { to: ROUTES.ADMIN_CONTENT, key: 'admin.sidebar.content', icon: FileText },
    ],
  },
]
