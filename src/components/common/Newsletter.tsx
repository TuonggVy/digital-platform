import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Button } from './Button'

export function Newsletter() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setEmail('')
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-base font-semibold text-white">{t('footer.newsletterTitle')}</h3>
      <p className="mt-1 text-sm text-slate-400">{t('footer.newsletterDesc')}</p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('footer.newsletterPlaceholder')}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus-ring focus:border-primary"
        />
        <Button type="submit" rightIcon={<Send className="size-4" />}>
          {t('footer.newsletterSubmit')}
        </Button>
      </form>
      {submitted && (
        <p className="mt-2 text-xs text-emerald-400">{t('footer.newsletterSuccess')}</p>
      )}
    </div>
  )
}
