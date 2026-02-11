"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, User, Shield, Gift } from "lucide-react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirect = searchParams.get("redirect") || "/"
  const refFromUrl = searchParams.get("ref")

  const { login, signup, adminLogin, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] =
    useState<"login" | "signup" | "admin">("login")

  const [showPassword, setShowPassword] = useState(false)

  const [loginLoading, setLoginLoading] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)

  const [loginData, setLoginData] = useState({ phone: "", password: "" })
  const [adminData, setAdminData] = useState({ phone: "", password: "" })

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  })

  /* ================= SAVE REFERRAL FROM URL ================= */
  useEffect(() => {
    if (refFromUrl) {
      localStorage.setItem("referral_code", refFromUrl)
    }
  }, [refFromUrl])

  /* ================= AUTO LOAD REFERRAL ================= */
  useEffect(() => {
    const storedRef = localStorage.getItem("referral_code")
    if (storedRef) {
      setSignupData((prev) => ({
        ...prev,
        referralCode: storedRef,
      }))
      setActiveTab("signup")
    }
  }, [])

  /* ================= AUTO REDIRECT IF LOGGED IN ================= */
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect)
    }
  }, [isAuthenticated, router, redirect])

  /* ================= LOGIN ================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)

    const result = await login(loginData.phone, loginData.password)

    if (result.success) {
      toast({ title: "Success", description: result.message })
      router.replace(redirect)
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }

    setLoginLoading(false)
  }

  /* ================= SIGNUP ================= */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setSignupLoading(false)
      return
    }

    const result = await signup(
      signupData.name.trim(),
      signupData.email.trim(),
      signupData.phone.trim(),
      signupData.password,
      signupData.referralCode || undefined
    )

    if (result.success) {
      toast({ title: "Success", description: result.message })

      // ✅ clear referral after success
      localStorage.removeItem("referral_code")

      setActiveTab("login")
      setLoginData({ phone: signupData.phone, password: "" })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }

    setSignupLoading(false)
  }

  /* ================= ADMIN ================= */
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)

    const result = await adminLogin(adminData.phone, adminData.password)

    if (result.success) {
      toast({ title: "Success", description: result.message })
      router.replace("/admin")
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }

    setAdminLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="flex gap-2">
                    <User /> Login
                  </CardTitle>
                  <CardDescription>Login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={loginData.phone}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </div>

                    <Button className="w-full" disabled={loginLoading}>
                      {loginLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SIGNUP */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex gap-2">
                    <Gift /> Sign Up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <Input
                      placeholder="Name"
                      value={signupData.name}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="Phone"
                      value={signupData.phone}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />

                    {/* Referral (auto) */}
                    <Input
                      placeholder="Referral Code"
                      value={signupData.referralCode}
                      readOnly
                    />

                    <Button className="w-full" disabled={signupLoading}>
                      {signupLoading ? "Creating..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ADMIN */}
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle className="flex gap-2">
                    <Shield /> Admin Login
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <Input
                      placeholder="Phone"
                      value={adminData.phone}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={adminData.password}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <Button className="w-full" disabled={adminLoading}>
                      {adminLoading ? "Logging in..." : "Admin Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
