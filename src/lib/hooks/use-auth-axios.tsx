"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi, tokenManager } from "@/lib/api/auth"
import { User, AuthState } from "@/lib/api/types"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, username: string, name?: string) => Promise<User>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated on page load
    const initAuth = async () => {
      try {
        const savedToken = tokenManager.getToken()
        const savedUser = tokenManager.getUser()

        if (savedToken && savedUser) {
          setToken(savedToken)
          setUser(savedUser)
          
          // Try to refresh token to verify it's still valid
          try {
            const authData = await authApi.refreshToken()
            setUser(authData.user)
            setToken(authData.token)
            tokenManager.setToken(authData.token)
            tokenManager.setUser(authData.user)
          } catch (error) {
            // Token is invalid, clear storage
            tokenManager.removeToken()
            tokenManager.removeUser()
            setUser(null)
            setToken(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        tokenManager.removeToken()
        tokenManager.removeUser()
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    void initAuth()
  }, [])

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const authData = await authApi.signIn({ email, password })
      
      setUser(authData.user)
      setToken(authData.token)
      tokenManager.setToken(authData.token)
      tokenManager.setUser(authData.user)
      
      return authData.user
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string, name?: string): Promise<User> => {
    try {
      const authData = await authApi.signUp({
        email,
        password,
        username,
        name
      })
      
      setUser(authData.user)
      setToken(authData.token)
      tokenManager.setToken(authData.token)
      tokenManager.setUser(authData.user)
      
      return authData.user
    } catch (error) {
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await authApi.signOut()
    } catch (error) {
      console.error("Sign out API error:", error)
    } finally {
      // Clear local state and storage regardless of API call result
      setUser(null)
      setToken(null)
      tokenManager.removeToken()
      tokenManager.removeUser()
      router.push("/signin")
    }
  }

  const refresh = async (): Promise<void> => {
    try {
      if (token) {
        const authData = await authApi.refreshToken()
        setUser(authData.user)
        setToken(authData.token)
        tokenManager.setToken(authData.token)
        tokenManager.setUser(authData.user)
      }
    } catch (error) {
      console.error("Auth refresh failed:", error)
      await signOut()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}