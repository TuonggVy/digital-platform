import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PublicUser } from '@/types'
import { authService, type RegisterInput } from '@/services/authService'
import { STORAGE_KEYS } from '@/constants/config'

interface AuthState {
  currentUser: PublicUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<PublicUser>
  register: (input: RegisterInput) => Promise<PublicUser>
  logout: () => void
  updateProfile: (updates: Partial<PublicUser>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const user = await authService.login(email, password)
        set({ currentUser: user, isAuthenticated: true })
        return user
      },

      register: async (input) => {
        const user = await authService.register(input)
        set({ currentUser: user, isAuthenticated: true })
        return user
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      updateProfile: async (updates) => {
        const current = get().currentUser
        if (!current) return
        const updated = await authService.updateProfile(current.id, updates)
        set({ currentUser: updated })
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
