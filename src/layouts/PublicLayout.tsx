import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ToastContainer } from '@/components/common/Toast'
import { PageTransition } from '@/components/animation/PageTransition'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
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
