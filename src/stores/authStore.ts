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
  logout: () => Promise<void>
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
        // Backend register does not issue JWT tokens — caller must navigate
        // to login afterwards instead of relying on this to authenticate.
        return authService.register(input)
      },

      logout: async () => {
        await authService.logout()
        set({ currentUser: null, isAuthenticated: false })
      },

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
