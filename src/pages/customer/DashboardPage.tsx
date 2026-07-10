import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Server, Wallet, LifeBuoy, Compass } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { orderService } from '@/services/orderService'
import { serviceService } from '@/services/serviceService'
import { ticketService } from '@/services/ticketService'
import type { CustomerService, Order } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import { ServiceStatusBadge } from '@/components/common/ServiceStatusBadge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

export function DashboardPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const currentUser = useAuthStore((s) => s.currentUser)

  const [orders, setOrders] = useState<Order[]>([])
  const [services, setServices] = useState<CustomerService[]>([])
  const [ticketCount, setTicketCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    let active = true
    setIsLoading(true)
    Promise.all([
      orderService.getOrdersByUser(currentUser.id),
      serviceService.getServicesByUser(currentUser.id),
      ticketService.getTicketsByUser(currentUser.id),
    ]).then(([o, s, tickets]) => {
      if (!active) return
      setOrders(o)
      setServices(s)
      setTicketCount(tickets.length)
      setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [currentUser])

  if (!currentUser) return null
  if (isLoading) return <LoadingSpinner className="py-32" label={t('common.loading')} />

  const activeServicesCount = services.filter((s) => s.status === 'ACTIVE').length
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)
  const recentOrders = orders.slice(0, 5)
  const expiringServices = services.filter((s) => s.status === 'EXPIRING_SOON')

  return (
    <div className="flex flex-col gap-8">
      <Seo title={t('account.sidebar.dashboard')} />

      <RevealOnScroll>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          {t('account.dashboard.greeting', { name: currentUser.name })}
        </h1>
      </RevealOnScroll>

      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <div className="flex items-center gap-3 rounded-2xl border border-border p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Server className="size-5" />
            </span>
            <div>
              <p className="text-xs text-text-secondary">{t('account.dashboard.activeServices')}</p>
              <p className="text-2xl font-semibold text-text-primary">{activeServicesCount}</p>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="flex items-center gap-3 rounded-2xl border border-border p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="text-xs text-text-secondary">{t('account.dashboard.totalSpent')}</p>
              <p className="text-2xl font-semibold text-text-primary">
                {formatCurrency(totalSpent, locale)}
              </p>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="flex items-center gap-3 rounded-2xl border border-border p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <LifeBuoy className="size-5" />
            </span>
            <div>
              <p className="text-xs text-text-secondary">{t('account.sidebar.tickets')}</p>
              <p className="text-2xl font-semibold text-text-primary">{ticketCount}</p>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      <RevealOnScroll>
        <div className="rounded-2xl border border-border p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('account.dashboard.recentOrders')}
            </h2>
            <Link
              to={ROUTES.ACCOUNT_ORDERS}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('common.seeAll')}
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title={t('account.orders.empty')} />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={ROUTES.ACCOUNT_ORDER_DETAIL(order.orderCode)}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:text-primary"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{order.orderCode}</p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(order.createdAt, locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text-primary">
                      {formatCurrency(order.total, locale)}
                    </span>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </RevealOnScroll>

      {expiringServices.length > 0 && (
        <RevealOnScroll>
          <div className="rounded-2xl border border-border p-5">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              {t('account.dashboard.expiringServices')}
            </h2>
            <div className="flex flex-col divide-y divide-border">
              {expiringServices.map((service) => (
                <Link
                  key={service.id}
                  to={ROUTES.ACCOUNT_SERVICE_DETAIL(service.id)}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:text-primary"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {service.productName} - {service.packageName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t('account.services.expiryDate')}: {formatDate(service.expiryDate, locale)}
                    </p>
                  </div>
                  <ServiceStatusBadge status={service.status} />
                </Link>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      )}

      <RevealOnScroll>
        <div className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('account.dashboard.quickActions')}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.PRODUCTS}>
              <Button leftIcon={<Compass className="size-4" />}>
                {t('account.dashboard.browseProducts')}
              </Button>
            </Link>
            <Link to={ROUTES.ACCOUNT_TICKET_NEW}>
              <Button variant="outline" leftIcon={<LifeBuoy className="size-4" />}>
                {t('account.dashboard.newTicket')}
              </Button>
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  )
}
