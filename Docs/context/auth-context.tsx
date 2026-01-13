"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const API_BASE = "http://127.0.0.1:8000"

/* ================= TYPES ================= */

interface User {
  id: number
  username: string
  email: string
  phone: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
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

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  /* -------- FETCH CURRENT USER WITH AUTO REFRESH -------- */
  const fetchCurrentUser = async () => {
    try {
      let res = await fetch(`${API_BASE}/api/me/`, { method: "GET", credentials: "include" })

      // If access token expired → try refresh
      if (res.status === 401) {
        console.log("Access token expired, refreshing...")
        const refreshRes = await fetch(`${API_BASE}/api/token/refresh/`, {
          method: "POST",
          credentials: "include",
        })

        const refreshData = await refreshRes.json()
        console.log("Refresh API returned:", refreshData)

        if (refreshRes.ok) {
          // Retry fetching current user after refresh
          res = await fetch(`${API_BASE}/api/me/`, { credentials: "include" })
        } else {
          console.log("Refresh token invalid or expired")
          throw new Error("Unauthorized")
        }
      }

      if (res.ok) {
        const data = await res.json()
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          phone: data.username,
          isAdmin: data.isAdmin || false,
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err)
      setUser(null)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  /* -------- LOGIN -------- */
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
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        phone: data.user.username,
        isAdmin: false,
      })
      return { success: true, message: "Login successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  /* -------- SIGNUP -------- */
  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string
  ) => {
    try {
      const body: any = { username: phone, email, password, name }
      if (referralCode) body.referralCode = referralCode

      const res = await fetch(`${API_BASE}/api/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) return { success: false, message: data.error || "Signup failed" }

      setUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        phone: data.user.username,
        isAdmin: false,
      })
      return { success: true, message: data.message }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  /* -------- ADMIN LOGIN -------- */
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
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        phone: data.user.username,
        isAdmin: true,
      })
      return { success: true, message: "Admin login successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  /* -------- LOGOUT -------- */
  const logout = async () => {
    await fetch(`${API_BASE}/api/logout/`, {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
  }

  /* ================= PROVIDER ================= */
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        login,
        signup,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ================= HOOK ================= */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
