export type UserRole = 'customer' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  company?: string
  taxCode?: string
  address?: string
  createdAt: string
}

export type PublicUser = Omit<User, 'password'>

export interface AuthSession {
  user: PublicUser
  token: string
  loginAt: string
}

export interface LoginSession {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}
