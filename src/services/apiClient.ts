import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '@/constants/config'

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: (): string | null => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  },
  clearTokens: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  },
}

/** Envelope every backend response is wrapped in: `{ code: 0, message, data }`. */
export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  timeout: 15000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN')

  const response = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    { refreshToken },
  )
  const { accessToken, refreshToken: newRefreshToken } = response.data.data
  tokenStorage.setTokens(accessToken, newRefreshToken)
  return accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const url = originalRequest?.url ?? ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const newAccessToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch {
        tokenStorage.clearTokens()
      }
    }

    const message =
      (error.response?.data as ApiEnvelope<unknown> | undefined)?.message ?? error.message
    return Promise.reject(new Error(message))
  },
)

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiEnvelope<T>>(url, { params })
  return response.data.data
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiEnvelope<T>>(url, body)
  return response.data.data
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiEnvelope<T>>(url, body)
  return response.data.data
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiEnvelope<T>>(url)
  return response.data.data
}
