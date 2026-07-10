import { create } from 'zustand'
import { generateId } from '@/utils/generators'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

interface UiState {
  isCartDrawerOpen: boolean
  isMobileMenuOpen: boolean
  toasts: ToastMessage[]
  openCartDrawer: () => void
  closeCartDrawer: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  showToast: (message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  toasts: [],

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  showToast: (message, type = 'success') => {
    const id = generateId('toast')
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },

  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
