import type { PublicUser, User } from '@/types'
import { mockUsers } from '@/data/mocks/users'
import { STORAGE_KEYS } from '@/constants/config'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { apiPost, tokenStorage } from './apiClient'

const repo = createRepository<User>(STORAGE_KEYS.USERS, mockUsers)

function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

interface BackendAuthUser {
  id: string
  fullName: string
  email: string
  role: string
  phone: string | null
  company: string | null
  taxCode: string | null
  address: string | null
}

interface BackendAuthResponse {
  accessToken: string
  refreshToken: string
  user: BackendAuthUser
}

function toFePublicUser(user: BackendAuthUser): PublicUser {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role.toLowerCase() as PublicUser['role'],
    phone: user.phone ?? undefined,
    company: user.company ?? undefined,
    taxCode: user.taxCode ?? undefined,
    address: user.address ?? undefined,
    createdAt: new Date().toISOString(),
  }
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
}

export const authService = {
  /**
   * Admin login now hits the real backend (`/auth/login`). Customer
   * login/register still runs against the local mock repo below — the backend
   * has no register/customer-auth endpoints yet (see backend README notes).
   */
  async login(email: string, password: string): Promise<PublicUser> {
    try {
      const result = await apiPost<BackendAuthResponse>('/auth/login', {
        email,
        password,
      })
      tokenStorage.setTokens(result.accessToken, result.refreshToken)
      return toFePublicUser(result.user)
    } catch (backendError) {
      // Fall back to the mock repo for demo customer accounts the backend doesn't know about yet.
      await delay()
      const user = repo.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (!user || user.password !== password) {
        throw backendError instanceof Error ? backendError : new Error('INVALID_CREDENTIALS')
      }
      return toPublicUser(user)
    }
  },

  async logout(): Promise<void> {
    try {
      await apiPost('/auth/logout')
    } catch {
      // best-effort — token is cleared locally regardless
    } finally {
      tokenStorage.clearTokens()
    }
  },

  async register(input: RegisterInput): Promise<PublicUser> {
    try {
      const user = await apiPost<BackendAuthUser>('/auth/register', {
        fullName: input.name,
        email: input.email,
        phone: input.phone,
        password: input.password,
      })
      return toFePublicUser(user)
    } catch (error) {
      if (error instanceof Error && /email/i.test(error.message)) {
        throw new Error('EMAIL_EXISTS', { cause: error })
      }
      throw error
    }
  },

  /**
   * Backend always returns the same neutral message whether the email exists or
   * not (anti-enumeration). In non-production, the response also carries
   * `debugResetUrl` so the full flow can be tested locally without a mail server —
   * this field never appears when the backend runs with NODE_ENV=production.
   */
  async forgotPassword(email: string): Promise<{ message: string; debugResetUrl?: string }> {
    return apiPost('/auth/forgot-password', { email })
  },

  async resetPassword(payload: { token: string; newPassword: string }): Promise<{ message: string }> {
    return apiPost('/auth/reset-password', payload)
  },

  async updateProfile(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'password' | 'role' | 'email'>>,
  ): Promise<PublicUser> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((u) => u.id === userId)
    if (index === -1) throw new Error('USER_NOT_FOUND')
    all[index] = { ...all[index], ...updates }
    repo.saveAll(all)
    return toPublicUser(all[index])
  },

  /**
   * Requires the caller to already be authenticated — the backend derives the
   * user from the JWT access token, not from any client-supplied id. Revokes
   * the user's refresh token server-side; caller must clear local tokens and
   * navigate to /login afterwards (no new access token is returned).
   */
  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    try {
      return await apiPost('/auth/change-password', payload)
    } catch (error) {
      if (error instanceof Error && /hiện tại không chính xác|incorrect/i.test(error.message)) {
        throw new Error('INVALID_CURRENT_PASSWORD', { cause: error })
      }
      if (error instanceof Error && /khác mật khẩu hiện tại|different/i.test(error.message)) {
        throw new Error('SAME_AS_CURRENT_PASSWORD', { cause: error })
      }
      throw error
    }
  },
}
