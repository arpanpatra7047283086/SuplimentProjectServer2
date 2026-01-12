"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  isAdmin: boolean
  referralCode: string
  referredBy?: string
  referralCoins: number
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (phone: string, password: string) => { success: boolean; message: string }
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string,
  ) => { success: boolean; message: string }
  adminLogin: (phone: string, password: string) => { success: boolean; message: string }
  logout: () => void
  addReferralCoins: (userId: string, coins: number) => void
  getAllUsers: () => User[]
}

// Admin credentials (set during development)
const ADMIN_CREDENTIALS = {
  phone: "9876543210",
  password: "admin123",
}

// Generate unique referral code
const generateReferralCode = (name: string): string => {
  const prefix = name.substring(0, 3).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${random}`
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("ss_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (phone: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("ss_users") || "[]")
    const foundUser = users.find((u: any) => u.phone === phone && u.password === password)

    if (foundUser) {
      const userData = { ...foundUser, isAdmin: false }
      delete userData.password
      setUser(userData)
      localStorage.setItem("ss_user", JSON.stringify(userData))
      return { success: true, message: "Login successful!" }
    }

    return { success: false, message: "Invalid phone number or password" }
  }

  const signup = (name: string, email: string, phone: string, password: string, referralCode?: string) => {
    const users = JSON.parse(localStorage.getItem("ss_users") || "[]")
    const exists = users.find((u: any) => u.phone === phone || u.email === email)

    if (exists) {
      return { success: false, message: "User already exists with this phone or email" }
    }

    let referredBy: string | undefined
    if (referralCode) {
      const referrer = users.find((u: any) => u.referralCode === referralCode)
      if (referrer) {
        referredBy = referrer.id
        // Add coins to referrer
        referrer.referralCoins = (referrer.referralCoins || 0) + 100
        const updatedUsers = users.map((u: any) => (u.id === referrer.id ? referrer : u))
        localStorage.setItem("ss_users", JSON.stringify(updatedUsers))
      }
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password,
      referralCode: generateReferralCode(name),
      referredBy,
      referralCoins: referralCode && referredBy ? 50 : 0, // New user gets 50 coins if used referral
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("ss_users", JSON.stringify(users))

    const userData = { ...newUser, isAdmin: false }
    delete (userData as any).password
    setUser(userData)
    localStorage.setItem("ss_user", JSON.stringify(userData))

    return {
      success: true,
      message: referralCode && referredBy ? "Account created! You earned 50 coins!" : "Account created successfully!",
    }
  }

  const adminLogin = (phone: string, password: string) => {
    if (phone === ADMIN_CREDENTIALS.phone && password === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: "admin",
        name: "Admin",
        email: "admin@sssupplement.com",
        phone: ADMIN_CREDENTIALS.phone,
        isAdmin: true,
        referralCode: "ADMIN001",
        referralCoins: 0,
        createdAt: new Date().toISOString(),
      }
      setUser(adminUser)
      localStorage.setItem("ss_user", JSON.stringify(adminUser))
      return { success: true, message: "Admin login successful!" }
    }

    return { success: false, message: "Invalid admin credentials" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ss_user")
  }

  const addReferralCoins = (userId: string, coins: number) => {
    const users = JSON.parse(localStorage.getItem("ss_users") || "[]")
    const updatedUsers = users.map((u: any) => {
      if (u.id === userId) {
        return { ...u, referralCoins: (u.referralCoins || 0) + coins }
      }
      return u
    })
    localStorage.setItem("ss_users", JSON.stringify(updatedUsers))

    // Update current user if it's them
    if (user && user.id === userId) {
      const updatedUser = { ...user, referralCoins: (user.referralCoins || 0) + coins }
      setUser(updatedUser)
      localStorage.setItem("ss_user", JSON.stringify(updatedUser))
    }
  }

  const getAllUsers = (): User[] => {
    const users = JSON.parse(localStorage.getItem("ss_users") || "[]")
    return users.map((u: any) => {
      const { password, ...userData } = u
      return userData
    })
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
        addReferralCoins,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
