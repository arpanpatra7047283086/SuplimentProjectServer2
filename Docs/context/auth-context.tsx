"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL;



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
  const [refreshing, setRefreshing] = useState(false)

 
  const fetchCurrentUser = async () => {
    try {
      let res = await fetch(`${API_BASE}/api/me/`, {
        method: "GET",
        credentials: "include", 
      })

      if (res.status === 401 && !refreshing) {
        setRefreshing(true)
        console.log("Access expired → refreshing token")

        const refreshRes = await fetch(`${API_BASE}/api/token/refresh/`, {
          method: "POST",
          credentials: "include", 
        })

        if (!refreshRes.ok) {
          console.error("Refresh failed → logging out")
          setUser(null)
          setRefreshing(false)
          return
        }

       
        res = await fetch(`${API_BASE}/api/me/`, {
          method: "GET",
          credentials: "include",
        })

        setRefreshing(false)
      }

      if (res.ok) {
        const data = await res.json()
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          isAdmin: data.isAdmin,
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Auth error:", err)
      setUser(null)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  
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
        isAdmin: false,
      })

      return { success: true, message: "Login successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  
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
        isAdmin: false,
      })

      return { success: true, message: data.message }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  
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
        isAdmin: true,
      })

      return { success: true, message: "Admin login successful" }
    } catch {
      return { success: false, message: "Server error" }
    }
  }

  
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


export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
