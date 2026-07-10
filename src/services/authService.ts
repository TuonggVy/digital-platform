import type { PublicUser, User } from '@/types'
import { mockUsers } from '@/data/mocks/users'
import { STORAGE_KEYS } from '@/constants/config'
import { createRepository } from './repository'
import { delay } from '@/utils/delay'
import { generateId } from '@/utils/generators'

const repo = createRepository<User>(STORAGE_KEYS.USERS, mockUsers)

function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
}

export const authService = {
  async login(email: string, password: string): Promise<PublicUser> {
    await delay()
    const user = repo.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || user.password !== password) {
      throw new Error('INVALID_CREDENTIALS')
    }
    return toPublicUser(user)
  },

  async register(input: RegisterInput): Promise<PublicUser> {
    await delay()
    const all = repo.getAll()
    if (all.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('EMAIL_EXISTS')
    }
    const newUser: User = {
      id: generateId('user'),
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      role: 'customer',
      createdAt: new Date().toISOString(),
    }
    repo.saveAll([...all, newUser])
    return toPublicUser(newUser)
  },

  async requestPasswordReset(_email: string): Promise<void> {
    await delay()
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await delay()
    const all = repo.getAll()
    const index = all.findIndex((u) => u.id === userId)
    if (index === -1 || all[index].password !== currentPassword) {
      throw new Error('INVALID_CURRENT_PASSWORD')
    }
    all[index] = { ...all[index], password: newPassword }
    repo.saveAll(all)
  },

  async getAllCustomers(): Promise<User[]> {
    await delay()
    return repo.getAll().filter((u) => u.role === 'customer')
  },
}
