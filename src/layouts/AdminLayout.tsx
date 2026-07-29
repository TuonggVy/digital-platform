import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'
import { ToastContainer } from '@/components/common/Toast'
import { PageTransition } from '@/components/animation/PageTransition'

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    // Flat, full-width admin shell — no outer "card" frame and no card-like treatment on `main`
    // either: it fills the entire remaining width with no margin/border/rounding of its own. The
    // only seam between sidebar and content is the single `border-l` below, placed on the wrapper
    // around both AdminHeader and main so the line runs unbroken from top to bottom (putting it on
    // `main` instead would start the line below the header, not through it).
    <div className="flex h-screen bg-admin-app-bg">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:border-l lg:border-admin-border">
        <AdminHeader mobileOpen={mobileOpen} onMenuClick={() => setMobileOpen(true)} />
        {/* main is the only scrolling region — header and sidebar stay put without needing `sticky`. */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-admin-surface p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {/* Keyed by path so navigating away from a crashed page clears the boundary. */}
            <AdminErrorBoundary key={location.pathname}>
              <PageTransition>
                <Outlet />
              </PageTransition>
            </AdminErrorBoundary>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
