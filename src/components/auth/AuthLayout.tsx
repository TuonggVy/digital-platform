import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideProps } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { BrandHeader } from './BrandHeader'
import { DecorativeBackground } from './DecorativeBackground'
import { AuthCard } from './AuthCard'
import { AuthFooter } from './AuthFooter'
import { ToastContainer } from '@/components/common/Toast'

export interface AuthTrustItem {
  icon: ComponentType<LucideProps>
  title: string
  description: string
}

interface AuthLayoutProps {
  title: string
  subtitle: string
  formError?: string | null
  footer: ReactNode
  backLink?: { label: string; to: string }
  trustItems?: AuthTrustItem[]
  children: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  formError,
  footer,
  backLink,
  trustItems,
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-home-ink font-plex">
      <DecorativeBackground />
      <BrandHeader />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          {backLink && (
            <Link
              to={backLink.to}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              {backLink.label}
            </Link>
          )}

          <AuthCard title={title} subtitle={subtitle} formError={formError} footer={footer}>
            {children}
          </AuthCard>

          {trustItems && trustItems.length > 0 && (
            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              {trustItems.map((item) => (
                <div key={item.title} className="flex flex-col items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-accent">
                    <item.icon className="size-4" />
                  </span>
                  <p className="text-xs font-medium text-white/80">{item.title}</p>
                  <p className="hidden text-[11px] leading-tight text-white/45 sm:block">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AuthFooter />
      <ToastContainer />
    </div>
  )
}
