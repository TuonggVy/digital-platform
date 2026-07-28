import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Users,
  Server,
  AlertTriangle,
  AlertCircle,
  Cloud,
  KeyRound,
  Wifi,
  Package,
} from 'lucide-react'
import { serviceService } from '@/services/serviceService'
import { orderApiService } from '@/services/orderApiService'
import type { BackendOrder } from '@/services/orderApiService'
import { customerApiService } from '@/services/customerApiService'
import type { CustomerService, ServiceStatus } from '@/types'
import { Seo } from '@/components/common/Seo'
import { DataTable } from '@/components/admin/DataTable'
import { BackendOrderStatusBadge } from '@/components/common/BackendOrderStatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { AdminDashboardHeader, type DashboardHealthStatus } from '@/components/admin/dashboard/AdminDashboardHeader'
import { StatCard } from '@/components/admin/StatCard'
import {
  ServiceOverviewPanel,
  type DistributionSegment,
  type ServiceOverviewCategory,
} from '@/components/admin/dashboard/ServiceOverviewPanel'
import { AttentionPanel, type AttentionGroup } from '@/components/admin/dashboard/AttentionPanel'
import { QuickActionsRow, type QuickAction } from '@/components/admin/dashboard/QuickActionsRow'
import {
  MetricsRowSkeleton,
  ServiceOverviewSkeleton,
  AttentionPanelSkeleton,
} from '@/components/admin/dashboard/DashboardSkeleton'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

interface CoreData {
  services: CustomerService[]
}

const RECENT_ORDERS_COUNT = 5

const SERVICE_STATUS_ORDER: ServiceStatus[] = [
  'ACTIVE',
  'PENDING_ACTIVATION',
  'EXPIRING_SOON',
  'EXPIRED',
  'SUSPENDED',
]
const SERVICE_STATUS_TONE: Record<ServiceStatus, string> = {
  ACTIVE: 'bg-emerald-500',
  PENDING_ACTIVATION: 'bg-amber-500',
  EXPIRING_SOON: 'bg-amber-500',
  EXPIRED: 'bg-red-500',
  SUSPENDED: 'bg-text-secondary/40',
}

function buildServiceSegments(list: CustomerService[], t: (key: string) => string): DistributionSegment[] {
  return SERVICE_STATUS_ORDER.map((status) => ({
    key: status,
    label: t(`status.service.${status}`),
    count: list.filter((service) => service.status === status).length,
    toneClass: SERVICE_STATUS_TONE[status],
  }))
}

function MetricValueSkeleton() {
  return <span className="inline-block h-7 w-14 animate-pulse rounded bg-surface" aria-hidden="true" />
}

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [coreData, setCoreData] = useState<CoreData | null>(null)
  const [coreError, setCoreError] = useState<string | null>(null)

  const [recentOrders, setRecentOrders] = useState<BackendOrder[]>([])
  const [ordersTotal, setOrdersTotal] = useState<number | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const [customerCount, setCustomerCount] = useState<number | null>(null)
  const [customerError, setCustomerError] = useState(false)

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Kept independent from the customer/orders fetches so a failure here never blocks
  // the rest of the dashboard from rendering.
  const loadCoreData = useCallback(async () => {
    setCoreError(null)
    try {
      const services = await serviceService.getAllForAdmin()
      setCoreData({ services })
    } catch (err) {
      setCoreData(null)
      setCoreError(err instanceof Error ? err.message : t('toast.genericError'))
    }
  }, [t])

  // Kept independent from the fetch above (and from the orders fetch below) so a
  // Customer API failure never blocks the rest of the dashboard from rendering.
  const loadCustomerCount = useCallback(async () => {
    try {
      const result = await customerApiService.getAdminCustomers({ page: 1, pageSize: 1 })
      setCustomerCount(result.total)
      setCustomerError(false)
    } catch {
      setCustomerError(true)
    }
  }, [])

  // Kept independent from the fetches above so Orders API errors/latency never
  // block the rest of the dashboard from rendering.
  const loadOrderStats = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const result = await orderApiService.getAdminOrders({
        page: 1,
        pageSize: RECENT_ORDERS_COUNT,
        sort: 'newest',
      })
      setRecentOrders(result.items)
      setOrdersTotal(result.total)
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : t('toast.genericError'))
    } finally {
      setOrdersLoading(false)
    }
  }, [t])

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.allSettled([loadCoreData(), loadCustomerCount(), loadOrderStats()])
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [loadCoreData, loadCustomerCount, loadOrderStats])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const services = coreData?.services ?? []

  const cloudServices = services.filter((s) => s.type === 'cloud')
  const kasperskyServices = services.filter((s) => s.type === 'kaspersky')
  const esimServices = services.filter((s) => s.type === 'esim')

  const activeServiceCount = services.filter((s) => s.status === 'ACTIVE').length
  const expiringSoonServices = services.filter((s) => s.status === 'EXPIRING_SOON')
  const suspendedServices = services.filter((s) => s.status === 'SUSPENDED')
  const attentionServiceCount = expiringSoonServices.length + suspendedServices.length

  const anyMetricSourceSettled =
    coreData !== null || coreError !== null || customerCount !== null || customerError || !ordersLoading

  const coreSettled = coreData !== null || coreError !== null
  const customerSettled = customerCount !== null || customerError
  const ordersSettled = !ordersLoading

  let healthStatus: DashboardHealthStatus
  if (!coreSettled || !customerSettled || !ordersSettled) {
    healthStatus = 'loading'
  } else if (coreError || customerError || ordersError) {
    healthStatus = 'unknown'
  } else if (attentionServiceCount > 0) {
    healthStatus = 'attention'
  } else {
    healthStatus = 'healthy'
  }

  const serviceOverviewCategories: ServiceOverviewCategory[] = [
    {
      key: 'cloud',
      label: t('admin.dashboard.serviceOverview.cloud'),
      icon: <Cloud className="size-4" />,
      href: ROUTES.ADMIN_CLOUD,
      serviceTotal: cloudServices.length,
      serviceSegments: buildServiceSegments(cloudServices, t),
      serviceEmptyLabel: t('admin.dashboard.serviceOverview.noServices'),
    },
    {
      key: 'kaspersky',
      label: t('admin.dashboard.serviceOverview.kaspersky'),
      icon: <KeyRound className="size-4" />,
      href: ROUTES.ADMIN_LICENSES,
      serviceTotal: kasperskyServices.length,
      serviceSegments: buildServiceSegments(kasperskyServices, t),
      serviceEmptyLabel: t('admin.dashboard.serviceOverview.noServices'),
    },
    {
      key: 'esim',
      label: t('admin.dashboard.serviceOverview.esim'),
      icon: <Wifi className="size-4" />,
      href: ROUTES.ADMIN_ESIMS,
      serviceTotal: esimServices.length,
      serviceSegments: buildServiceSegments(esimServices, t),
      serviceEmptyLabel: t('admin.dashboard.serviceOverview.noServices'),
    },
  ]

  const attentionGroups: AttentionGroup[] = [
    {
      key: 'expiringSoon',
      label: t('admin.dashboard.attention.expiringSoon'),
      count: expiringSoonServices.length,
    },
    {
      key: 'suspended',
      label: t('admin.dashboard.attention.suspended'),
      count: suspendedServices.length,
    },
  ]

  const quickActions: QuickAction[] = [
    { key: 'orders', label: t('admin.sidebar.orders'), href: ROUTES.ADMIN_ORDERS, icon: <ShoppingBag className="size-4" /> },
    { key: 'products', label: t('admin.sidebar.products'), href: ROUTES.ADMIN_PRODUCTS, icon: <Package className="size-4" /> },
    { key: 'cloud', label: t('nav.megamenu.cloud'), href: ROUTES.ADMIN_CLOUD, icon: <Cloud className="size-4" /> },
    { key: 'licenses', label: t('admin.sidebar.licenses'), href: ROUTES.ADMIN_LICENSES, icon: <KeyRound className="size-4" /> },
    { key: 'esims', label: t('admin.sidebar.esims'), href: ROUTES.ADMIN_ESIMS, icon: <Wifi className="size-4" /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Seo title={t('admin.dashboard.title')} />

      <AdminDashboardHeader
        status={healthStatus}
        lastUpdated={lastUpdated}
        onRefresh={refreshAll}
        isRefreshing={isRefreshing}
      />

      {!anyMetricSourceSettled ? (
        <div aria-busy="true">
          <MetricsRowSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ShoppingBag className="size-5" />}
            label={t('admin.dashboard.totalOrders')}
            href={ROUTES.ADMIN_ORDERS}
            value={
              ordersLoading && ordersTotal === null ? (
                <MetricValueSkeleton />
              ) : ordersError ? (
                '—'
              ) : (
                (ordersTotal ?? 0).toLocaleString('vi-VN')
              )
            }
          />
          <StatCard
            icon={<Users className="size-5" />}
            label={t('admin.dashboard.totalCustomers')}
            href={ROUTES.ADMIN_CUSTOMERS}
            value={
              customerCount === null && !customerError ? (
                <MetricValueSkeleton />
              ) : customerError ? (
                '—'
              ) : (
                (customerCount ?? 0).toLocaleString('vi-VN')
              )
            }
          />
          <StatCard
            icon={<Server className="size-5" />}
            label={t('admin.dashboard.activeServices')}
            value={
              coreData === null && !coreError ? (
                <MetricValueSkeleton />
              ) : coreError ? (
                '—'
              ) : (
                activeServiceCount.toLocaleString('vi-VN')
              )
            }
          />
          <StatCard
            icon={<AlertTriangle className="size-5" />}
            label={t('admin.dashboard.servicesNeedingAttention')}
            tone={attentionServiceCount > 0 ? 'attention' : 'default'}
            value={
              coreData === null && !coreError ? (
                <MetricValueSkeleton />
              ) : coreError ? (
                '—'
              ) : (
                attentionServiceCount.toLocaleString('vi-VN')
              )
            }
          />
        </div>
      )}

      {coreData === null && !coreError ? (
        <div aria-busy="true">
          <ServiceOverviewSkeleton columns={3} />
        </div>
      ) : coreError ? (
        <div role="alert">
          <EmptyState
            icon={<AlertCircle className="size-6" />}
            title={t('common.error')}
            description={coreError}
            action={
              <button
                type="button"
                onClick={loadCoreData}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
              >
                {t('common.tryAgain')}
              </button>
            }
          />
        </div>
      ) : (
        <ServiceOverviewPanel
          title={t('admin.dashboard.serviceOverview.title')}
          categories={serviceOverviewCategories}
          viewAllLabel={t('common.seeAll')}
        />
      )}

      <div className="rounded-2xl border border-border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-text-primary">
            {t('admin.dashboard.recentOrders')}
          </h2>
          <Link
            to={ROUTES.ADMIN_ORDERS}
            className="-m-1.5 rounded p-1.5 text-sm font-medium text-primary hover:underline focus-ring"
          >
            {t('common.seeAll')}
          </Link>
        </div>
        {ordersError ? (
          <div role="alert">
            <EmptyState
              icon={<AlertCircle className="size-6" />}
              title={t('common.error')}
              description={ordersError}
              action={
                <button
                  type="button"
                  onClick={loadOrderStats}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
                >
                  {t('common.tryAgain')}
                </button>
              }
            />
          </div>
        ) : (
          <div aria-busy={ordersLoading}>
            <DataTable
              data={recentOrders}
              isLoading={ordersLoading}
              emptyTitle={t('admin.orders.noOrders')}
              rowKey={(o) => o.id}
              columns={[
                {
                  key: 'code',
                  header: t('admin.orders.orderCode'),
                  render: (o) => <span className="font-data">{o.orderCode}</span>,
                },
                { key: 'customer', header: t('admin.orders.customer'), render: (o) => o.customerName },
                {
                  key: 'total',
                  header: t('admin.orders.total'),
                  render: (o) => formatCurrency(o.totalAmount, locale),
                },
                {
                  key: 'status',
                  header: t('admin.orders.status'),
                  render: (o) => <BackendOrderStatusBadge status={o.status} />,
                },
                {
                  key: 'date',
                  header: t('admin.orders.date'),
                  render: (o) => <span className="font-data">{formatDateTime(o.createdDate, locale)}</span>,
                },
                {
                  key: 'actions',
                  header: <span className="sr-only">{t('common.actions')}</span>,
                  className: 'text-right',
                  render: (o) => (
                    <Link
                      to={ROUTES.ADMIN_ORDER_DETAIL(o.id)}
                      aria-label={`${t('common.viewDetails')} — ${o.orderCode}`}
                      className="-m-1.5 inline-block rounded p-1.5 text-sm font-medium text-primary hover:underline focus-ring"
                    >
                      {t('common.viewDetails')}
                    </Link>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>

      {coreData === null && !coreError ? (
        <div aria-busy="true">
          <AttentionPanelSkeleton />
        </div>
      ) : coreError ? null : (
        <AttentionPanel
          title={t('admin.dashboard.attention.title')}
          groups={attentionGroups}
          emptyLabel={t('admin.dashboard.attention.empty')}
        />
      )}

      <QuickActionsRow title={t('admin.dashboard.quickActions.title')} actions={quickActions} />
    </div>
  )
}
