"use client"

import { useEffect, useState } from "react"
import { Gift, Copy, CheckCircle, Coins, Share2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

interface ReferralResponse {
  code: string
  whatsapp_url: string
}

export default function ReferralPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, loading: authLoading } = useAuth() // ✅ include loading

  const [coins, setCoins] = useState<number>(0)
  const [referral, setReferral] = useState<ReferralResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  // ================= AUTH CHECK + FETCH WALLET =================
  useEffect(() => {
    if (authLoading) return // wait until auth finishes

    if (!isAuthenticated) {
      router.replace("/login?redirect=/referral")
      return
    }

    const fetchWallet = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/my-wallet/`, {
          credentials: "include",
        })

        if (!res.ok) {
          router.replace("/login?redirect=/referral")
          return
        }

        const data = await res.json()
        setCoins(data.coins)
      } catch (err) {
        toast({ title: "Error", description: "Failed to fetch wallet" })
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [authLoading, isAuthenticated, router, toast])

  // ================= GENERATE REFERRAL =================
  const generateReferral = async () => {
    setGenerating(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-referral/`, {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login?redirect=/referral")
        } else if (res.status === 403) {
          toast({ title: "Not allowed", description: "You are not authorized to generate a referral" })
        } else {
          toast({ title: "Error", description: "Failed to generate referral code" })
        }
        return
      }

      const data: ReferralResponse = await res.json()
      setReferral(data)
      window.open(data.whatsapp_url, "_blank")
    } catch (err) {
      toast({ title: "Server Error", description: "Something went wrong" })
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  // ================= COPY CODE =================
  const copyCode = () => {
    if (!referral) return
    navigator.clipboard.writeText(referral.code)
    setCopied(true)
    toast({ title: "Copied!", description: "Referral code copied" })
    setTimeout(() => setCopied(false), 2000)
  }

  // ================= LOADING =================
  if (authLoading || loading) {
    return <p className="text-center mt-20">Loading...</p>
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Refer & Earn</h1>
            <p className="text-muted-foreground">Share once • Earn once • Simple</p>
          </div>

          {/* Wallet Coins */}
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <Coins className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{coins}</p>
              <p className="text-sm text-muted-foreground">Your Coins</p>
            </CardContent>
          </Card>

          {/* Referral Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              {!referral ? (
                <Button onClick={generateReferral} disabled={generating} className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  {generating ? "Generating..." : "Generate & Share on WhatsApp"}
                </Button>
              ) : (
                <>
                  <p className="text-4xl font-bold tracking-widest text-primary">{referral.code}</p>

                  <Button variant="outline" onClick={copyCode}>
                    {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied" : "Copy Code"}
                  </Button>

                  <p className="text-sm text-muted-foreground">⚠️ This referral code can be used only once</p>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  )
}
