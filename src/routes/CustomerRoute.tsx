import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

export function CustomerRoute() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />
  }

  if (currentUser.role === 'admin') {
    return <Navigate to={ROUTES.ADMIN} replace />
  }

  return <Outlet />
}
