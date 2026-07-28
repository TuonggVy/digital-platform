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
    // No outer "card" frame — the admin app is flat, full-bleed background. Only `main`
    // (the white content surface) keeps its own rounded corner; sidebar/header sit directly
    // on the flat bg-admin-app-bg with no enclosing rounded/bordered wrapper around them.
    <div className="flex h-screen bg-admin-app-bg">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader mobileOpen={mobileOpen} onMenuClick={() => setMobileOpen(true)} />
        {/* main is the only scrolling region — header and sidebar stay put without needing `sticky`. */}
        <main
  className="
    mr-3
    min-w-0
    flex-1
    overflow-y-auto
    border-x-[1.5px]
    border-t-[1.5px]
    border-[#D8DEE8]
    bg-admin-surface
    p-4
    sm:p-6
    lg:mr-4
    lg:rounded-tl-admin-surface
    lg:rounded-tr-[24px]
    lg:p-8
  "
>
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
