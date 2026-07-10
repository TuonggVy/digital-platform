import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Smartphone } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/common/SearchBar'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { contentService } from '@/services/contentService'
import type { EsimDevice } from '@/data/mocks/esimDevices'

export function EsimDevicesPage() {
  const { t } = useTranslation()
  const [devices, setDevices] = useState<EsimDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    contentService.getEsimDevices().then((data) => {
      setDevices(data)
      setIsLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return devices
    return devices.filter(
      (d) => d.model.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q),
    )
  }, [devices, search])

  const grouped = useMemo(() => {
    const map = new Map<string, EsimDevice[]>()
    for (const device of filtered) {
      const list = map.get(device.brand) ?? []
      list.push(device)
      map.set(device.brand, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('esimDevicesPage.title')} description={t('esimDevicesPage.subtitle')} />

      <RevealOnScroll className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('esimDevicesPage.title')}
        </h1>
        <p className="mt-3 text-text-secondary">{t('esimDevicesPage.subtitle')}</p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05} className="mx-auto mt-8 max-w-xl">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('esimDevicesPage.searchPlaceholder')}
        />
      </RevealOnScroll>

      <div className="mt-10">
        {isLoading ? (
          <LoadingSpinner label={t('common.loading')} />
        ) : grouped.length === 0 ? (
          <EmptyState icon={<Smartphone className="size-6" />} title={t('common.noResults')} />
        ) : (
          <div className="flex flex-col gap-8">
            {grouped.map(([brand, items]) => (
              <RevealOnScroll key={brand}>
                <h2 className="text-lg font-semibold text-text-primary">{brand}</h2>
                <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                  {items.map((device, idx) => (
                    <div
                      key={device.id}
                      className={`flex items-center justify-between gap-4 px-5 py-3.5 ${idx % 2 === 0 ? 'bg-background' : 'bg-surface/40'}`}
                    >
                      <span className="text-sm text-text-primary">{device.model}</span>
                      {device.supported ? (
                        <Badge variant="success">{t('esimDevicesPage.supported')}</Badge>
                      ) : (
                        <Badge variant="danger">{t('esimDevicesPage.notSupported')}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
