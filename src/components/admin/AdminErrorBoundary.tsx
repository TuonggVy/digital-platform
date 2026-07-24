import { Component, type ReactNode } from 'react'
import { withTranslation, type WithTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

interface AdminErrorBoundaryProps extends WithTranslation {
  children: ReactNode
}

interface AdminErrorBoundaryState {
  hasError: boolean
}

/** Route-level safety net for the Admin shell — if an admin page throws during
 *  render, this shows a recoverable, Admin-scoped error surface instead of a
 *  full white-screen crash (no boundary previously wrapped the Admin Outlet). */
class AdminErrorBoundaryBase extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  state: AdminErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    console.error('Admin page crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    const { t } = this.props
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <AlertTriangle className="size-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">{t('admin.errorBoundary.title')}</h2>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">{t('admin.errorBoundary.description')}</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark focus-ring"
        >
          {t('admin.errorBoundary.reload')}
        </button>
      </div>
    )
  }
}

export const AdminErrorBoundary = withTranslation()(AdminErrorBoundaryBase)
