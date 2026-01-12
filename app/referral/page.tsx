"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, Copy, CheckCircle, Users, Coins, Share2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ReferralPage() {
  const router = useRouter()
  const { user, isAuthenticated, getAllUsers } = useAuth()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!isAuthenticated) {
    router.push("/login?redirect=/referral")
    return null
  }

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/login?ref=${user?.referralCode}`

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || "")
    setCopied(true)
    toast({ title: "Copied!", description: "Referral code copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join SS Supplement",
        text: `Use my referral code ${user?.referralCode} to get 50 coins on signup! Shop premium supplements at SS Supplement.`,
        url: referralLink,
      })
    } else {
      navigator.clipboard.writeText(referralLink)
      toast({ title: "Link Copied!", description: "Share this link with your friends" })
    }
  }

  // Get referral stats
  const allUsers = getAllUsers()
  const referredUsers = allUsers.filter((u) => u.referredBy === user?.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Refer & Earn</h1>
            <p className="text-muted-foreground">
              Share your referral code with friends and earn coins on every successful signup!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Coins className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{user?.referralCoins || 0}</p>
                <p className="text-sm text-muted-foreground">Your Coins</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{referredUsers.length}</p>
                <p className="text-sm text-muted-foreground">Friends Referred</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Gift className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{referredUsers.length * 100}</p>
                <p className="text-sm text-muted-foreground">Coins Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code Card */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Your Referral Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-primary tracking-widest mb-4">{user?.referralCode}</p>
                <div className="flex justify-center gap-3">
                  <Button onClick={copyReferralCode} variant="outline">
                    {copied ? <CheckCircle className="h-4 w-4 mr-2 text-success" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                  <Button onClick={shareReferral} className="bg-primary hover:bg-primary/90">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">How it Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Share Your Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your unique referral code with friends and family
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Friend Signs Up</h3>
                  <p className="text-sm text-muted-foreground">
                    Your friend creates an account using your referral code
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Both Earn Coins</h3>
                  <p className="text-sm text-muted-foreground">
                    You get 100 coins and your friend gets 50 coins instantly!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referred Friends */}
          {referredUsers.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referredUsers.map((referredUser) => (
                    <div
                      key={referredUser.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {referredUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{referredUser.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(referredUser.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-success font-semibold">+100 coins</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
