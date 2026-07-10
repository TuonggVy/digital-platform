import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { orderService } from '@/services/orderService'
import { authService } from '@/services/authService'
import type { Order, User } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'

interface CustomerRow extends User {
  orderCount: number
  totalSpent: number
}

export function AdminCustomersPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  const [rows, setRows] = useState<CustomerRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([authService.getAllCustomers(), orderService.getAllOrders()])
      .then(([customers, orders]: [User[], Order[]]) => {
        const merged = customers.map((customer) => {
          const customerOrders = orders.filter((o) => o.userId === customer.id)
          return {
            ...customer,
            orderCount: customerOrders.length,
            totalSpent: customerOrders
              .filter((o) => o.paymentStatus === 'PAID')
              .reduce((sum, o) => sum + o.total, 0),
          }
        })
        setRows(merged)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
  }, [rows, search])

  return (
    <div>
      <Seo title={t('admin.customers.title')} />
      <PageHeader title={t('admin.customers.title')} />

      <div className="mb-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('admin.customers.searchPlaceholder')}
          className="sm:max-w-xs"
        />
      </div>

      <DataTable
        data={filtered}
        isLoading={isLoading}
        rowKey={(r) => r.id}
        emptyTitle={t('admin.customers.noCustomers')}
        columns={[
          { key: 'name', header: t('admin.customers.name'), render: (r) => r.name },
          { key: 'email', header: t('admin.customers.email'), render: (r) => r.email },
          { key: 'phone', header: t('admin.customers.phone'), render: (r) => r.phone ?? '-' },
          {
            key: 'orderCount',
            header: t('admin.customers.orderCount'),
            render: (r) => r.orderCount,
          },
          {
            key: 'totalSpent',
            header: t('admin.customers.totalSpent'),
            render: (r) => formatCurrency(r.totalSpent, locale),
          },
        ]}
      />
    </div>
  )
}
