import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ShoppingBag, Users, Server, AlertTriangle, AlertCircle } from 'lucide-react'
import { serviceService } from '@/services/serviceService'
import { productService } from '@/services/productService'
import { inventoryService } from '@/services/inventoryService'
import { orderApiService } from '@/services/orderApiService'
import type { BackendOrder } from '@/services/orderApiService'
import { customerApiService } from '@/services/customerApiService'
import { Seo } from '@/components/common/Seo'
import { StatCard } from '@/components/admin/StatCard'
import { DataTable } from '@/components/admin/DataTable'
import { BackendOrderStatusBadge } from '@/components/common/BackendOrderStatusBadge'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

interface DashboardData {
  activeServiceCount: number
  lowStockProducts: { productId: string; productName: string; available: number }[]
}

const RECENT_ORDERS_COUNT = 5

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const [data, setData] = useState<DashboardData | null>(null)

  const [recentOrders, setRecentOrders] = useState<BackendOrder[]>([])
  const [ordersTotal, setOrdersTotal] = useState<number | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const [customerCount, setCustomerCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      serviceService.getAllForAdmin(),
      productService.getAllForAdmin(),
      inventoryService.getLicenses(),
      inventoryService.getEsimStock(),
    ]).then(([services, products, licenses, esimStock]) => {
      if (cancelled) return

      const productNameById = new Map(products.map((p) => [p.id, p.name[locale]]))
      const availableByProduct = new Map<string, { productName: string; available: number }>()
      for (const lic of licenses) {
        if (lic.status !== 'AVAILABLE') continue
        const entry = availableByProduct.get(lic.productId) ?? {
          productName: lic.productName,
          available: 0,
        }
        entry.available += 1
        availableByProduct.set(lic.productId, entry)
      }
      for (const esim of esimStock) {
        if (esim.status !== 'AVAILABLE') continue
        const productName = productNameById.get(esim.productId) ?? esim.productId
        const entry = availableByProduct.get(esim.productId) ?? { productName, available: 0 }
        entry.available += 1
        availableByProduct.set(esim.productId, entry)
      }
      const lowStockProducts = Array.from(availableByProduct.entries())
        .map(([productId, v]) => ({ productId, productName: v.productName, available: v.available }))
        .filter((v) => v.available < 2)

      setData({
        activeServiceCount: services.filter((s) => s.status === 'ACTIVE').length,
        lowStockProducts,
      })
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  // Kept independent from the fetch above (and from the orders fetch below) so a
  // Customer API failure never blocks the rest of the dashboard from rendering.
  useEffect(() => {
    let cancelled = false
    customerApiService
      .getAdminCustomers({ page: 1, pageSize: 1 })
      .then((result) => {
        if (cancelled) return
        setCustomerCount(result.total)
      })
      .catch(() => {
        if (cancelled) return
        setCustomerCount(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Kept independent from the fetch above so Orders API errors/latency never
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

  useEffect(() => {
    loadOrderStats()
  }, [loadOrderStats])

  if (!data) {
    return (
      <div>
        <Seo title={t('admin.dashboard.title')} />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <Seo title={t('admin.dashboard.title')} />
      <h1 className="mb-6 text-2xl font-semibold text-text-primary sm:text-3xl">
        {t('admin.dashboard.title')}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ShoppingBag className="size-5" />}
          label={t('admin.dashboard.totalOrders')}
          value={ordersTotal === null ? '-' : ordersTotal.toLocaleString('vi-VN')}
        />
        <StatCard
          icon={<Users className="size-5" />}
          label={t('admin.dashboard.totalCustomers')}
          value={customerCount === null ? '-' : customerCount.toLocaleString('vi-VN')}
        />
        <StatCard
          icon={<Server className="size-5" />}
          label={t('admin.dashboard.activeServices')}
          value={data.activeServiceCount.toLocaleString('vi-VN')}
        />
      </div>

      {data.lowStockProducts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-text-primary">
            <AlertTriangle className="size-5 text-amber-500" />
            {t('admin.dashboard.lowStockAlert')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.lowStockProducts.map((item) => (
              <Badge key={item.productId} variant="warning">
                {item.productName}: {item.available}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">
            {t('admin.dashboard.recentOrders')}
          </h2>
          <Link to={ROUTES.ADMIN_ORDERS} className="text-sm font-medium text-primary hover:underline">
            {t('common.seeAll')}
          </Link>
        </div>
        {ordersError ? (
          <EmptyState
            icon={<AlertCircle className="size-6" />}
            title={t('common.error')}
            description={ordersError}
            action={
              <button
                type="button"
                onClick={loadOrderStats}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
              >
                {t('common.tryAgain')}
              </button>
            }
          />
        ) : (
          <DataTable
            data={recentOrders}
            isLoading={ordersLoading}
            emptyTitle={t('admin.orders.noOrders')}
            rowKey={(o) => o.id}
            columns={[
              { key: 'code', header: t('admin.orders.orderCode'), render: (o) => o.orderCode },
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
                render: (o) => formatDateTime(o.createdDate, locale),
              },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (o) => (
                  <Link
                    to={ROUTES.ADMIN_ORDER_DETAIL(o.id)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t('common.viewDetails')}
                  </Link>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}
