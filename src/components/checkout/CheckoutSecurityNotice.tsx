import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Honest security copy only — no unearned certification claims. */
export function CheckoutSecurityNotice() {
  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface p-4 text-xs text-text-secondary">
      <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <p>{t('checkout.security.notice1')}</p>
        <p>{t('checkout.security.notice2')}</p>
      </div>
    </div>
  )
}
