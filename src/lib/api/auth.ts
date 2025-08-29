import { api, handleApiError, ApiResponse } from '@/lib/axios'
import { AuthCredentials, RegisterCredentials, AuthResponse, User } from './types'
import { setCookie, deleteCookie, getCookie } from '@/lib/utils/cookies'

// Auth API endpoints
export const authApi = {
  // Sign in with email and password
  signIn: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/collections/users/auth-with-password', {
        identity: credentials.email,
        password: credentials.password,
      })
      return {
        user: response.data.record,
        token: response.data.token,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Register new user
  signUp: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      // First create the user
      const userData = {
        email: credentials.email,
        password: credentials.password,
        passwordConfirm: credentials.password,
        username: credentials.username,
        name: credentials.name || credentials.username,
      }
      
      const createResponse = await api.post('/collections/users/records', userData)
      
      // Then authenticate
      const authResponse = await api.post('/collections/users/auth-with-password', {
        identity: credentials.email,
        password: credentials.password,
      })
      
      // Send verification email
      await api.post('/collections/users/request-verification', {
        email: credentials.email,
      })
      
      return {
        user: authResponse.data.record,
        token: authResponse.data.token,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Sign out (client-side token cleanup)
  signOut: async (): Promise<void> => {
    try {
      await api.post('/auth/signout')
    } catch (error) {
      // Even if API call fails, we should clear local storage
      console.warn('Sign out API call failed:', error)
    } finally {
      // Clear local storage regardless of API call result
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    }
  },

  // Refresh authentication token
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/collections/users/auth-refresh')
      return {
        user: response.data.record,
        token: response.data.token,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get current user profile (requires auth token)
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/collections/users/auth-refresh')
      return response.data.record
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Send password reset email
  resetPassword: async (email: string): Promise<void> => {
    try {
      await api.post('/collections/users/request-password-reset', { email })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Confirm password reset with token
  confirmPasswordReset: async (token: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/collections/users/confirm-password-reset', { 
        token, 
        password: newPassword,
        passwordConfirm: newPassword,
      })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<void> => {
    try {
      await api.post('/collections/users/confirm-verification', { token })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Resend email verification
  resendVerification: async (email: string): Promise<void> => {
    try {
      await api.post('/collections/users/request-verification', { email })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // OAuth endpoints (if needed)
  oAuth: {
    google: async (code: string): Promise<AuthResponse> => {
      try {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/oauth/google', { code })
        return response.data.data
      } catch (error) {
        throw new Error(handleApiError(error))
      }
    },

    github: async (code: string): Promise<AuthResponse> => {
      try {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/oauth/github', { code })
        return response.data.data
      } catch (error) {
        throw new Error(handleApiError(error))
      }
    },
  },
}

// Helper functions for token management
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  },

  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      setCookie('auth_token', token, 7)
    }
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      deleteCookie('auth_token')
    }
  },

  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      try {
        return userStr ? JSON.parse(userStr) as User : null
      } catch {
        return null
      }
    }
    return null
  },

  setUser: (user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
      setCookie('user', JSON.stringify(user), 7)
    }
  },

  removeUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      deleteCookie('user')
    }
  },
}