import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { serviceService } from '@/services/serviceService'
import type { CustomerService } from '@/types'

/** Loads every provisioned customer service (Cloud + Kaspersky + eSIM) for admin list pages. */
export function useAdminServices() {
  const { t } = useTranslation()
  const [services, setServices] = useState<CustomerService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)
    serviceService
      .getAllForAdmin()
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : t('toast.genericError')))
      .finally(() => setIsLoading(false))
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  return { services, isLoading, error, reload: load }
}
