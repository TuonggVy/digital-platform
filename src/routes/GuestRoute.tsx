import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

export function GuestRoute() {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? ROUTES.ADMIN : ROUTES.ACCOUNT} replace />
  }

  return <Outlet />
}
