import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { ToastContainer } from '@/components/common/Toast'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { MobileNav } from '@/components/layout/MobileNav'
import { CustomerSidebar } from '@/components/account/CustomerSidebar'
import { PageTransition } from '@/components/animation/PageTransition'
import { useAuthStore } from '@/stores/authStore'

export function CustomerLayout() {
  const currentUser = useAuthStore((s) => s.currentUser)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 self-start lg:sticky lg:top-24 lg:block">
          <div className="mb-4 rounded-xl border border-border bg-surface/50 p-4">
            <p className="text-sm font-semibold text-text-primary">{currentUser?.name}</p>
            <p className="truncate text-xs text-text-secondary">{currentUser?.email}</p>
          </div>
          <CustomerSidebar />
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mb-4 -mx-1 pb-1 lg:hidden">
            <CustomerSidebar orientation="horizontal" />
          </div>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileNav />
      <CartDrawer />
      <ToastContainer />
    </div>
  )
}
