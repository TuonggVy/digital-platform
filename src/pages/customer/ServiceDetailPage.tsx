import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { serviceService } from '@/services/serviceService'
import type { CustomerService } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import {
  CloudServiceCard,
  EsimServiceCard,
  KasperskyServiceCard,
} from '@/components/account/ServiceCards'
import { ROUTES } from '@/constants/routes'

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const showToast = useUiStore((s) => s.showToast)

  const [service, setService] = useState<CustomerService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)

  useEffect(() => {
    if (!serviceId) return
    setIsLoading(true)
    serviceService.getServiceById(serviceId).then((s) => {
      if (!s) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      setService(s)
      setIsLoading(false)
    })
  }, [serviceId])

  useEffect(() => {
    if (notFound) navigate(ROUTES.ACCOUNT_SERVICES)
  }, [notFound, navigate])

  async function handleRenew(id: string) {
    setIsRenewing(true)
    try {
      const updated = await serviceService.renewService(id)
      setService(updated)
      showToast(t('toast.statusUpdated'), 'success')
    } finally {
      setIsRenewing(false)
    }
  }

  if (isLoading) return <LoadingSpinner className="py-32" label={t('common.loading')} />
  if (!service) return null

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${service.productName} - ${service.packageName}`} />

      <Breadcrumb
        items={[
          { label: t('account.services.title'), href: ROUTES.ACCOUNT_SERVICES },
          { label: service.productName },
        ]}
      />

      <RevealOnScroll>
        <div className="mx-auto w-full max-w-2xl">
          {service.type === 'cloud' && (
            <CloudServiceCard
              service={service}
              onRenew={handleRenew}
              isRenewing={isRenewing}
              linkTitle={false}
            />
          )}
          {service.type === 'kaspersky' && (
            <KasperskyServiceCard
              service={service}
              onRenew={handleRenew}
              isRenewing={isRenewing}
              linkTitle={false}
            />
          )}
          {service.type === 'esim' && <EsimServiceCard service={service} linkTitle={false} />}
        </div>
      </RevealOnScroll>
    </div>
  )
}
