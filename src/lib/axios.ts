import axios, { AxiosResponse, AxiosError } from 'axios'
import { env } from '@/env'

// Create axios instance with PocketBase API configuration
export const api = axios.create({
  baseURL: `${env.NEXT_PUBLIC_POCKETBASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token (client-side only)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
      // Redirect to signin page
      if (typeof window !== 'undefined') {
        window.location.href = '/signin'
      }
    }
    return Promise.reject(error)
  }
)

// API Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// Error handling utility
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export default api