import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { customerApiService } from '@/services/customerApiService'
import type { AdminCustomerDetail } from '@/services/customerApiService'
import { Seo } from '@/components/common/Seo'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PaymentStatusBadge } from '@/components/common/PaymentStatusBadge'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

export function AdminCustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const { t } = useTranslation()
  const locale = useLocale()

  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCustomer = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await customerApiService.getAdminCustomerDetail(id)
        setCustomer(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('toast.genericError'))
      } finally {
        setIsLoading(false)
      }
    },
    [t],
  )

  useEffect(() => {
    if (!customerId) return
    loadCustomer(customerId)
  }, [customerId, loadCustomer])

  if (!customerId) return null

  if (isLoading) {
    return <LoadingSpinner className="py-32" label={t('common.loading')} />
  }

  if (error || !customer) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title={t('admin.customers.noCustomers')}
        description={error ?? undefined}
        action={
          <Link to={ROUTES.ADMIN_CUSTOMERS}>
            <Button variant="outline">{t('admin.customers.title')}</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${t('admin.customers.title')} - ${customer.fullName}`} />

      <Breadcrumb
        items={[
          { label: t('admin.customers.title'), href: ROUTES.ADMIN_CUSTOMERS },
          { label: customer.fullName },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            {customer.fullName}
          </h1>
          <p className="text-sm text-text-secondary">{customer.email}</p>
        </div>
        <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {t(`admin.customers.status${customer.status === 'ACTIVE' ? 'Active' : 'Inactive'}`)}
        </Badge>
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          {t('admin.orders.customerInfo')}
        </h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('admin.customers.name')}</dt>
            <dd className="text-right font-medium text-text-primary">{customer.fullName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('admin.customers.email')}</dt>
            <dd className="text-right font-medium text-text-primary">{customer.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('admin.customers.phone')}</dt>
            <dd className="text-right font-medium text-text-primary">{customer.phone ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('admin.customers.joinedDate')}</dt>
            <dd className="text-right font-medium text-text-primary">
              {formatDateTime(customer.createdDate, locale)}
            </dd>
          </div>
          {customer.modifiedDate && (
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t('admin.orders.modifiedDate')}</dt>
              <dd className="text-right font-medium text-text-primary">
                {formatDateTime(customer.modifiedDate, locale)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          {t('admin.customers.title')}
        </h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('admin.customers.orderCount')}</dt>
            <dd className="text-right font-medium text-text-primary">{customer.orderCount}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">{t('admin.customers.totalSpent')}</dt>
            <dd className="text-right font-medium text-text-primary">
              {formatCurrency(customer.totalSpent, locale)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          {t('admin.customers.latestPayment')}
        </h2>
        {customer.latestPayment ? (
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t('payment.paymentCode')}</dt>
              <dd className="text-right font-medium text-text-primary">
                {customer.latestPayment.paymentCode}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t('payment.status')}</dt>
              <dd className="text-right">
                <PaymentStatusBadge
                  status={customer.latestPayment.status as 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'EXPIRED'}
                />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t('payment.amount')}</dt>
              <dd className="text-right font-medium text-text-primary">
                {formatCurrency(customer.latestPayment.amount, locale)}
              </dd>
            </div>
            {customer.latestPayment.paidAt && (
              <div className="flex justify-between gap-3">
                <dt className="text-text-secondary">{t('payment.paidAt')}</dt>
                <dd className="text-right font-medium text-text-primary">
                  {formatDateTime(customer.latestPayment.paidAt, locale)}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-text-secondary">{t('admin.customers.noPaymentYet')}</p>
        )}
      </div>
    </div>
  )
}
