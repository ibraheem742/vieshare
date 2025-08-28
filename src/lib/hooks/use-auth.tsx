"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { pb, type PBUser, type AuthState, COLLECTIONS } from "@/lib/pocketbase"
import { signInWithPassword, signUpWithEmailPassword, signOut as pbSignOut } from "@/lib/pocketbase-helpers"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<PBUser>
  signUp: (email: string, password: string, username: string, name?: string) => Promise<PBUser>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PBUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated on page load
    const initAuth = async () => {
      try {
        // This will trigger the onChange event if the token is valid
        await pb.collection(COLLECTIONS.USERS).authRefresh()
      } catch (error) {
        // This will trigger the onChange event with a null user
        pb.authStore.clear()
      } finally {
        setIsLoading(false)
      }
    }

    void initAuth()

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (token && model) {
        setUser(model as unknown as PBUser)
        setToken(token)
        Cookies.set("pb_auth", pb.authStore.exportToCookie(), { expires: 7 })
      } else {
        setUser(null)
        setToken(null)
        Cookies.remove("pb_auth")
      }
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string): Promise<PBUser> => {
    try {
      const userData = await signInWithPassword(email, password)
      setUser(userData)
      setToken(pb.authStore.token)
      return userData
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string, name?: string): Promise<PBUser> => {
    try {
      const user = await signUpWithEmailPassword({
        email,
        password,
        username,
        name
      })
      
      setUser(user)
      setToken(pb.authStore.token)
      
      return user
    } catch (error) {
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      pbSignOut()
      setUser(null)
      setToken(null)
      Cookies.remove("pb_auth")
      router.push("/signin")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const refresh = async (): Promise<void> => {
    try {
      if (pb.authStore.isValid) {
        await pb.collection(COLLECTIONS.USERS).authRefresh()
        const userData = pb.authStore.model as unknown as PBUser
        setUser(userData)
        setToken(pb.authStore.token)
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