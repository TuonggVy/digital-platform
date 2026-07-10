import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DollarSign, ShoppingBag, Users, Server, AlertTriangle } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { authService } from '@/services/authService'
import { serviceService } from '@/services/serviceService'
import { productService } from '@/services/productService'
import { inventoryService } from '@/services/inventoryService'
import type { Order, ProductCategory } from '@/types'
import { Seo } from '@/components/common/Seo'
import { StatCard } from '@/components/admin/StatCard'
import { DataTable } from '@/components/admin/DataTable'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import { Badge } from '@/components/common/Badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

interface DashboardData {
  orders: Order[]
  customerCount: number
  activeServiceCount: number
  productNameById: Map<string, string>
  lowStockProducts: { productId: string; productName: string; available: number }[]
}

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  cloud: 'var(--color-primary)',
  kaspersky: 'var(--color-secondary)',
  esim: 'var(--color-accent)',
}

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      orderService.getAllOrders(),
      authService.getAllCustomers(),
      serviceService.getAllForAdmin(),
      productService.getAllForAdmin(),
      inventoryService.getLicenses(),
      inventoryService.getEsimStock(),
    ]).then(([orders, customers, services, products, licenses, esimStock]) => {
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
        .map(([productId, v]) => ({
          productId,
          productName: v.productName,
          available: v.available,
        }))
        .filter((v) => v.available < 2)

      setData({
        orders,
        customerCount: customers.length,
        activeServiceCount: services.filter((s) => s.status === 'ACTIVE').length,
        productNameById,
        lowStockProducts,
      })
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  const totalRevenue = useMemo(
    () =>
      data
        ? data.orders.filter((o) => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.total, 0)
        : 0,
    [data],
  )

  const revenueChartData = useMemo(() => {
    if (!data) return []
    const byMonth = new Map<string, { sortKey: string; label: string; total: number }>()
    for (const order of data.orders) {
      const date = new Date(order.createdAt)
      const sortKey = format(date, 'yyyy-MM')
      const label = format(date, 'MM/yyyy')
      const entry = byMonth.get(sortKey) ?? { sortKey, label, total: 0 }
      entry.total += order.total
      byMonth.set(sortKey, entry)
    }
    return Array.from(byMonth.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [data])

  const categoryChartData = useMemo(() => {
    if (!data) return []
    const counts = new Map<ProductCategory, number>()
    for (const order of data.orders) {
      for (const item of order.items) {
        counts.set(item.category, (counts.get(item.category) ?? 0) + item.quantity)
      }
    }
    return Array.from(counts.entries()).map(([category, count]) => ({
      category,
      label: t(`nav.megamenu.${category}`),
      count,
    }))
  }, [data, t])

  const topProducts = useMemo(() => {
    if (!data) return []
    const byProduct = new Map<
      string,
      { productId: string; productName: string; quantity: number }
    >()
    for (const order of data.orders) {
      for (const item of order.items) {
        const entry = byProduct.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
        }
        entry.quantity += item.quantity
        byProduct.set(item.productId, entry)
      }
    }
    return Array.from(byProduct.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [data])

  const recentOrders = useMemo(() => (data ? data.orders.slice(0, 5) : []), [data])

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<DollarSign className="size-5" />}
          label={t('admin.dashboard.totalRevenue')}
          value={formatCurrency(totalRevenue, locale)}
        />
        <StatCard
          icon={<ShoppingBag className="size-5" />}
          label={t('admin.dashboard.totalOrders')}
          value={data.orders.length.toLocaleString('vi-VN')}
        />
        <StatCard
          icon={<Users className="size-5" />}
          label={t('admin.dashboard.totalCustomers')}
          value={data.customerCount.toLocaleString('vi-VN')}
        />
        <StatCard
          icon={<Server className="size-5" />}
          label={t('admin.dashboard.activeServices')}
          value={data.activeServiceCount.toLocaleString('vi-VN')}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {t('admin.dashboard.revenueChart')}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                  tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}tr`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), locale)}
                  contentStyle={{
                    background: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    color: 'var(--color-text-primary)',
                  }}
                />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {t('admin.dashboard.categoryChart')}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {categoryChartData.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    color: 'var(--color-text-primary)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">
              {t('admin.dashboard.recentOrders')}
            </h2>
            <Link
              to={ROUTES.ADMIN_ORDERS}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('common.seeAll')}
            </Link>
          </div>
          <DataTable
            data={recentOrders}
            rowKey={(o) => o.id}
            columns={[
              { key: 'code', header: t('admin.orders.orderCode'), render: (o) => o.orderCode },
              {
                key: 'customer',
                header: t('admin.orders.customer'),
                render: (o) => o.customerInfo.fullName,
              },
              {
                key: 'total',
                header: t('admin.orders.total'),
                render: (o) => formatCurrency(o.total, locale),
              },
              {
                key: 'status',
                header: t('admin.orders.status'),
                render: (o) => <OrderStatusBadge status={o.orderStatus} />,
              },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-border p-5">
          <h2 className="mb-3 text-base font-semibold text-text-primary">
            {t('admin.dashboard.topProducts')}
          </h2>
          <DataTable
            data={topProducts}
            rowKey={(p) => p.productId}
            columns={[
              { key: 'name', header: t('admin.products.name'), render: (p) => p.productName },
              { key: 'qty', header: t('common.quantity'), render: (p) => p.quantity },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
