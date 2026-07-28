import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

interface ServiceLoadErrorProps {
  error: string
  onRetry: () => void
}

export function ServiceLoadError({ error, onRetry }: ServiceLoadErrorProps) {
  const { t } = useTranslation()

  return (
    <EmptyState
      icon={<AlertCircle className="size-6" />}
      title={t('common.error')}
      description={error}
      action={
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
        >
          {t('common.tryAgain')}
        </button>
      }
    />
  )
}
