import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { serviceService } from '@/services/serviceService'
import type { CustomerService } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Tabs } from '@/components/common/Tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import {
  CloudServiceCard,
  EsimServiceCard,
  KasperskyServiceCard,
} from '@/components/account/ServiceCards'

type ServiceTab = 'all' | 'cloud' | 'kaspersky' | 'esim'

export function ServicesPage() {
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.currentUser)
  const showToast = useUiStore((s) => s.showToast)

  const [services, setServices] = useState<CustomerService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ServiceTab>('all')
  const [renewingId, setRenewingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    setIsLoading(true)
    serviceService.getServicesByUser(currentUser.id).then((s) => {
      setServices(s)
      setIsLoading(false)
    })
  }, [currentUser])

  const filteredServices = useMemo(
    () => (activeTab === 'all' ? services : services.filter((s) => s.type === activeTab)),
    [services, activeTab],
  )

  async function handleRenew(id: string) {
    setRenewingId(id)
    try {
      const updated = await serviceService.renewService(id)
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)))
      showToast(t('toast.statusUpdated'), 'success')
    } finally {
      setRenewingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Seo title={t('account.services.title')} />

      <RevealOnScroll>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            {t('account.services.title')}
          </h1>
          <Tabs
            value={activeTab}
            onChange={(v) => setActiveTab(v as ServiceTab)}
            tabs={[
              { value: 'all', label: t('common.all') },
              { value: 'cloud', label: t('nav.megamenu.cloud') },
              { value: 'kaspersky', label: t('nav.megamenu.kaspersky') },
              { value: 'esim', label: t('nav.megamenu.esim') },
            ]}
          />
        </div>
      </RevealOnScroll>

      {isLoading ? (
        <LoadingSpinner className="py-24" label={t('common.loading')} />
      ) : filteredServices.length === 0 ? (
        <EmptyState title={t('account.services.empty')} />
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredServices.map((service) => (
            <StaggerItem key={service.id}>
              {service.type === 'cloud' && (
                <CloudServiceCard
                  service={service}
                  onRenew={handleRenew}
                  isRenewing={renewingId === service.id}
                />
              )}
              {service.type === 'kaspersky' && (
                <KasperskyServiceCard
                  service={service}
                  onRenew={handleRenew}
                  isRenewing={renewingId === service.id}
                />
              )}
              {service.type === 'esim' && <EsimServiceCard service={service} />}
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}
