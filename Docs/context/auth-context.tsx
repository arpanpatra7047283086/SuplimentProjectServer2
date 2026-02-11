"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL


// ================= TYPES =================
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
  logout: () => void
}

// ================= CONTEXT =================
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ================= PROVIDER =================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ================= FETCH CURRENT USER =================
  const fetchCurrentUser = async () => {
    const access = localStorage.getItem("access")
    if (!access) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/profile/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      })

      if (!res.ok) throw new Error("Unauthorized")

      const data = await res.json()

      setUser({
        id: data.id,
        username: data.name || data.phone,
        email: data.email,
        isAdmin: data.is_staff || false,
      })
    } catch {
      localStorage.removeItem("access")
      localStorage.removeItem("refresh")
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
        body: JSON.stringify({ phone, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, message: data.detail || "Login failed" }
      }

      // Save JWT tokens
      localStorage.setItem("access", data.tokens.access)
      localStorage.setItem("refresh", data.tokens.refresh)

      setUser({
        id: data.user.id,
        username: data.user.name || data.user.phone,
        email: data.user.email,
        isAdmin: data.user.is_staff || false,
      })

      return { success: true, message: "Login successful" }
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
      const body: any = {
        name,
        email,
        phone,
        password,
        confirmPassword: password, // REQUIRED BY BACKEND
      }

      if (referralCode) body.referralCode = referralCode

      const res = await fetch(`${API_BASE}/api/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, message: JSON.stringify(data) }
      }

      // Save tokens
      localStorage.setItem("access", data.tokens.access)
      localStorage.setItem("refresh", data.tokens.refresh)

      setUser({
        id: data.user.id,
        username: data.user.name || data.user.phone,
        email: data.user.email,
        isAdmin: false,
      })

      return { success: true, message: "Signup successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
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
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

// ================= HOOK =================
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
