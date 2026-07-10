import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QrCode, Copy, Eye, EyeOff, RefreshCw, LifeBuoy, BookOpen } from 'lucide-react'
import type { CloudService, EsimService, KasperskyService } from '@/types'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { ServiceStatusBadge } from '@/components/common/ServiceStatusBadge'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { formatDate, maskLicenseKey } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  )
}

function ServiceTitle({
  productName,
  packageName,
  serviceId,
  linkTitle,
}: {
  productName: string
  packageName: string
  serviceId: string
  linkTitle?: boolean
}) {
  return (
    <div>
      {linkTitle ? (
        <Link
          to={ROUTES.ACCOUNT_SERVICE_DETAIL(serviceId)}
          className="text-base font-semibold text-text-primary hover:text-primary"
        >
          {productName}
        </Link>
      ) : (
        <h2 className="text-base font-semibold text-text-primary">{productName}</h2>
      )}
      <p className="text-sm text-text-secondary">{packageName}</p>
    </div>
  )
}

interface ServiceCardBaseProps {
  onRenew: (id: string) => void
  isRenewing?: boolean
  linkTitle?: boolean
}

export function CloudServiceCard({
  service,
  onRenew,
  isRenewing,
  linkTitle = true,
}: ServiceCardBaseProps & { service: CloudService }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ServiceTitle
          productName={service.productName}
          packageName={service.packageName}
          serviceId={service.id}
          linkTitle={linkTitle}
        />
        <ServiceStatusBadge status={service.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InfoItem label={t('account.services.ip')} value={service.ip} />
        <InfoItem label="CPU" value={service.cpu} />
        <InfoItem label="RAM" value={service.ram} />
        <InfoItem label={t('productDetail.ssd')} value={service.ssd} />
        <InfoItem label={t('account.services.region')} value={service.region} />
        <InfoItem
          label={t('account.services.startDate')}
          value={formatDate(service.startDate, locale)}
        />
        <InfoItem
          label={t('account.services.expiryDate')}
          value={formatDate(service.expiryDate, locale)}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          size="sm"
          variant="outline"
          isLoading={isRenewing}
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={() => onRenew(service.id)}
        >
          {t('common.renew')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<LifeBuoy className="size-3.5" />}
          onClick={() =>
            navigate(ROUTES.ACCOUNT_TICKET_NEW, {
              state: { serviceId: service.id, category: 'cloud' },
            })
          }
        >
          {t('common.support')}
        </Button>
      </div>
    </div>
  )
}

export function KasperskyServiceCard({
  service,
  onRenew,
  isRenewing,
  linkTitle = true,
}: ServiceCardBaseProps & { service: KasperskyService }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()
  const showToast = useUiStore((s) => s.showToast)
  const [isRevealed, setIsRevealed] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(service.licenseKey)
    showToast(t('common.copied'), 'success')
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ServiceTitle
          productName={service.productName}
          packageName={service.packageName}
          serviceId={service.id}
          linkTitle={linkTitle}
        />
        <ServiceStatusBadge status={service.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-2">
          <p className="text-xs text-text-secondary">{t('account.services.licenseKey')}</p>
          <p className="break-all font-mono text-sm font-medium text-text-primary">
            {isRevealed ? service.licenseKey : maskLicenseKey(service.licenseKey)}
          </p>
        </div>
        <InfoItem label={t('productDetail.devices')} value={String(service.devices)} />
        <InfoItem
          label={t('account.services.startDate')}
          value={formatDate(service.startDate, locale)}
        />
        <InfoItem
          label={t('account.services.expiryDate')}
          value={formatDate(service.expiryDate, locale)}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          size="sm"
          variant="outline"
          leftIcon={isRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          onClick={() => setIsRevealed((v) => !v)}
        >
          {t('common.viewKey')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Copy className="size-3.5" />}
          onClick={handleCopy}
        >
          {t('common.copy')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          isLoading={isRenewing}
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={() => onRenew(service.id)}
        >
          {t('common.renew')}
        </Button>
        <Link to={ROUTES.SUPPORT_DETAIL('kich-hoat-license-kaspersky')}>
          <Button size="sm" variant="ghost" leftIcon={<BookOpen className="size-3.5" />}>
            {t('account.services.activationGuide')}
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<LifeBuoy className="size-3.5" />}
          onClick={() =>
            navigate(ROUTES.ACCOUNT_TICKET_NEW, {
              state: { serviceId: service.id, category: 'kaspersky' },
            })
          }
        >
          {t('common.support')}
        </Button>
      </div>
    </div>
  )
}

export function EsimServiceCard({
  service,
  linkTitle = true,
}: {
  service: EsimService
  linkTitle?: boolean
}) {
  const { t } = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()
  const [isQrOpen, setIsQrOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-5 sm:flex-row">
      <div className="flex shrink-0 justify-center sm:justify-start">
        <div className="flex size-20 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-text-secondary">
          <QrCode className="size-8" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <ServiceTitle
            productName={service.productName}
            packageName={service.packageName}
            serviceId={service.id}
            linkTitle={linkTitle}
          />
          <ServiceStatusBadge status={service.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <InfoItem label={t('productDetail.country')} value={service.country} />
          <InfoItem label={t('productDetail.dataAmount')} value={service.dataAmount} />
          <InfoItem label={t('productDetail.days')} value={String(service.days)} />
          <InfoItem
            label={t('account.services.expiryDate')}
            value={formatDate(service.expiryDate, locale)}
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<QrCode className="size-3.5" />}
            onClick={() => setIsQrOpen(true)}
          >
            {t('common.viewQr')}
          </Button>
          <Link to={ROUTES.SUPPORT_DETAIL('cai-dat-esim-qua-ma-qr')}>
            <Button size="sm" variant="ghost" leftIcon={<BookOpen className="size-3.5" />}>
              {t('account.services.installGuide')}
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<LifeBuoy className="size-3.5" />}
            onClick={() =>
              navigate(ROUTES.ACCOUNT_TICKET_NEW, {
                state: { serviceId: service.id, category: 'esim' },
              })
            }
          >
            {t('common.support')}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        title={t('common.viewQr')}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex size-56 items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-text-secondary">
            <QrCode className="size-24" />
          </div>
          <p className="text-center text-xs text-text-secondary">{service.qrCodeData}</p>
        </div>
      </Modal>
    </div>
  )
}
