import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ToastContainer } from '@/components/common/Toast'
import { PageTransition } from '@/components/animation/PageTransition'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

export function PublicLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === ROUTES.HOME

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Header is `fixed` (see Header.tsx) so it no longer reserves layout space — every route
       *  except Home compensates with top padding matching its h-16 height. Home omits it so its
       *  Hero section renders behind the transparent-over-Hero navbar instead of below a gap. */}
      <main className={cn('flex-1', !isHomePage && 'pt-16')}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <ToastContainer />
    </div>
  )
}
