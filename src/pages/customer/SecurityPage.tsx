import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Laptop, Smartphone, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { authService } from '@/services/authService'
import type { LoginSession } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

function buildPasswordSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z.string().min(1, t('validation.required')),
      newPassword: z
        .string()
        .min(1, t('validation.required'))
        .min(6, t('validation.minLength', { count: 6 })),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
}

type PasswordFormValues = z.infer<ReturnType<typeof buildPasswordSchema>>

const INITIAL_SESSIONS: LoginSession[] = [
  {
    id: 'session-1',
    device: 'Chrome trên Windows',
    location: 'Hồ Chí Minh, Việt Nam',
    lastActive: 'Vừa xong',
    current: true,
  },
  {
    id: 'session-2',
    device: 'Safari trên iPhone',
    location: 'Hà Nội, Việt Nam',
    lastActive: '2 ngày trước',
    current: false,
  },
  {
    id: 'session-3',
    device: 'Edge trên Windows',
    location: 'Đà Nẵng, Việt Nam',
    lastActive: '5 ngày trước',
    current: false,
  },
]

export function SecurityPage() {
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.currentUser)
  const showToast = useUiStore((s) => s.showToast)

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [sessions, setSessions] = useState<LoginSession[]>(INITIAL_SESSIONS)

  const schema = useMemo(() => buildPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(data: PasswordFormValues) {
    if (!currentUser) return
    try {
      await authService.changePassword(currentUser.id, data.currentPassword, data.newPassword)
      showToast(t('account.security.passwordChanged'), 'success')
      reset()
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CURRENT_PASSWORD') {
        setError('currentPassword', { message: t('account.security.currentPasswordInvalid') })
      } else {
        showToast(t('toast.genericError'), 'error')
      }
    }
  }

  function toggleTwoFactor() {
    setIsTwoFactorEnabled((v) => !v)
  }

  function revokeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Seo title={t('account.security.title')} />

      <RevealOnScroll>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          {t('account.security.title')}
        </h1>
      </RevealOnScroll>

      <RevealOnScroll>
        <form
          className="flex flex-col gap-4 rounded-2xl border border-border p-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <h2 className="text-lg font-semibold text-text-primary">
            {t('account.security.changePassword')}
          </h2>
          <Input
            label={t('account.security.currentPassword')}
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label={t('account.security.newPassword')}
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label={t('account.security.confirmPassword')}
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full sm:w-auto">
            {t('common.save')}
          </Button>
        </form>
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="flex flex-col gap-3 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {t('account.security.twoFactor')}
              </h2>
              <p className="text-sm text-text-secondary">{t('account.security.twoFactorDesc')}</p>
            </div>
          </div>
          <Button
            variant={isTwoFactorEnabled ? 'outline' : 'primary'}
            onClick={toggleTwoFactor}
            className="shrink-0"
          >
            {isTwoFactorEnabled ? t('account.security.disable') : t('account.security.enable')}
          </Button>
        </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="rounded-2xl border border-border p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('account.security.sessions')}
          </h2>
          <div className="flex flex-col divide-y divide-border">
            {sessions.map((session) => {
              const Icon =
                session.device.toLowerCase().includes('iphone') ||
                session.device.toLowerCase().includes('android')
                  ? Smartphone
                  : Laptop
              return (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-text-secondary">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{session.device}</p>
                        {session.current && (
                          <Badge variant="success">{t('account.security.currentSession')}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary">
                        {session.location} - {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button size="sm" variant="outline" onClick={() => revokeSession(session.id)}>
                      {t('account.security.revoke')}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </RevealOnScroll>
    </div>
  )
}
