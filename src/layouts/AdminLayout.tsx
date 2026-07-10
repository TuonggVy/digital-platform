import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ToastContainer } from '@/components/common/Toast'
import { PageTransition } from '@/components/animation/PageTransition'

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface/30">
      <div className="flex min-h-screen">
        <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminHeader mobileOpen={mobileOpen} onMenuClick={() => setMobileOpen(true)} />
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
            <main className="min-w-0 flex-1">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </main>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
