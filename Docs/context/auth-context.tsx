"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

interface User {
  id: number
  username: string
  email: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string
  ) => Promise<{ success: boolean; message: string }>
  adminLogin: (phone: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ================= FETCH CURRENT USER =================
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/me/`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setUser({
          id: data.id,
          username: data.username || data.phone,
          email: data.email || "",
          isAdmin: data.isAdmin || false,
        })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // ================= LOGIN =================
  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: phone, password }),
      })
      const data = await res.json()

      if (!res.ok) return { success: false, message: data.error || "Login failed" }

      setUser({
        id: data.user?.id || 0,
        username: data.user?.phone || data.user?.username || phone,
        email: data.user?.email || "",
        isAdmin: false,
      })

      return { success: true, message: data.message || "Login successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  // ================= SIGNUP =================
  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string
  ) => {
    try {
      const body: any = { name, email, phone, password }
      if (referralCode) body.referralCode = referralCode

      const res = await fetch(`${API_BASE}/api/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) return { success: false, message: data.error || "Signup failed" }
      return { success: true, message: data.message || "Signup successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  // ================= ADMIN LOGIN =================
  const adminLogin = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: phone, password }),
      })
      const data = await res.json()

      if (!res.ok) return { success: false, message: data.error || "Admin login failed" }

      setUser({
        id: data.user?.id || 0,
        username: data.user?.username || phone,
        email: data.user?.email || "",
        isAdmin: true,
      })

      return { success: true, message: data.message || "Admin login successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  // ================= LOGOUT =================
  const logout = async () => {
    await fetch(`${API_BASE}/api/logout/`, {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        loading,
        login,
        signup,
        adminLogin,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

// ================= USE AUTH HOOK =================
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
