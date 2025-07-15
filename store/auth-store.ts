import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  username: string
  email: string
  profileImage?: string
  bio?: string
  isAdmin: boolean
  isSuperAdmin: boolean
  saisenBalance: number
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isHydrated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setHydrated: (hydrated: boolean) => void
  logout: () => void
  verifyToken: () => Promise<boolean>
  isTokenValid: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => {
        console.log("Setting user in store:", user?.username)
        set({ user })
      },

      setToken: (token) => {
        console.log("Setting token in store:", token ? token.substring(0, 30) + "..." : "null")
        set({ token })
      },

      setLoading: (isLoading) => set({ isLoading }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      logout: () => {
        console.log("Logging out user")
        set({ user: null, token: null })
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage")
          localStorage.removeItem("mock_active_tokens")
        }
      },

      isTokenValid: () => {
        const { token, user } = get()
        const isValid = !!(token && user)
        console.log("Token validity check:", { hasToken: !!token, hasUser: !!user, isValid })
        return isValid
      },

      verifyToken: async () => {
        const { token } = get()
        if (!token) {
          console.log("No token to verify")
          return false
        }

        try {
          console.log("Verifying token with server...")
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          })

          if (!response.ok) {
            console.log("Token verification failed:", response.status)
            // Clear invalid auth data
            set({ user: null, token: null })
            if (typeof window !== "undefined") {
              localStorage.removeItem("auth-storage")
              localStorage.removeItem("mock_active_tokens")
            }
            return false
          }

          const result = await response.json()
          console.log("Token verification successful, updating user")
          set({ user: result.user })
          return true
        } catch (error) {
          console.error("Token verification error:", error)
          // Clear invalid auth data on error
          set({ user: null, token: null })
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-storage")
            localStorage.removeItem("mock_active_tokens")
          }
          return false
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        console.log("Auth store rehydrated:", {
          hasUser: !!state?.user,
          hasToken: !!state?.token,
          username: state?.user?.username,
        })
        // Mark store as hydrated
        if (state) {
          state.setHydrated(true)
        }
      },
      // Only persist user and token
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
)
