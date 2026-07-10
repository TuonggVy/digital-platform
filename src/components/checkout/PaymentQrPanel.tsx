import { useTranslation } from 'react-i18next'
import { QrCode } from 'lucide-react'
import { MOCK_BANK_TRANSFER } from '@/constants/config'

interface PaymentQrPanelProps {
  method: 'bank_transfer' | 'vietqr'
}

/** Placeholder demo panel shown when the customer picks bank transfer or VietQR — no real payment gateway involved. */
export function PaymentQrPanel({ method }: PaymentQrPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/40 p-5 sm:flex-row sm:items-start">
      {method === 'vietqr' && (
        <div className="mx-auto flex size-36 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-text-secondary sm:mx-0">
          <QrCode className="size-12" />
          <span className="text-[10px] uppercase tracking-wide">Demo QR</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 text-sm">
        <p className="font-medium text-text-primary">{t('checkout.qr.title')}</p>
        <p className="text-xs text-text-secondary">{t('checkout.qr.note')}</p>

        <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <span className="text-text-secondary">{t('checkout.qr.bankName')}</span>
          <span className="font-medium text-text-primary">{MOCK_BANK_TRANSFER.bankName}</span>
          <span className="text-text-secondary">{t('checkout.qr.accountName')}</span>
          <span className="font-medium text-text-primary">{MOCK_BANK_TRANSFER.accountName}</span>
          <span className="text-text-secondary">{t('checkout.qr.accountNumber')}</span>
          <span className="font-medium text-text-primary">{MOCK_BANK_TRANSFER.accountNumber}</span>
          <span className="text-text-secondary">{t('checkout.qr.transferContent')}</span>
          <span className="font-medium text-text-primary">NOVA-XXXXXX</span>
        </div>

        <p className="mt-1 text-xs italic text-text-secondary">
          {t('checkout.qr.orderCodePending')}
        </p>
      </div>
    </div>
  )
}
