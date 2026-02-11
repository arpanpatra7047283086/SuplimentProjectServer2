"use client"

import { useEffect, useState, useRef } from "react"
import { Gift, Coins, Users, Share2, Copy } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

const API_BASE = process.env.NEXT_PUBLIC_API_URL


/* ================= TYPES ================= */

interface Profile {
  id: number
  name: string
  email: string
  phone: string
  points: number
  referral_code: string
  total_referrals: number
}

interface Referral {
  id: number
  referee_name: string
  referee_phone: string
  referrer_points_awarded: number
  created_at: string
}

interface LeaderboardUser {
  id: number
  name: string
  points: number
}

/* ================= COMPONENT ================= */

export default function ReferralPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const redirected = useRef(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  /* ================= FETCH ================= */

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      if (!redirected.current) {
        redirected.current = true
        router.replace("/login?redirect=/referral")
      }
      return
    }

    const token = localStorage.getItem("access")
    if (!token) {
      router.replace("/login")
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    const fetchAll = async () => {
      try {
        const [p, r, l] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/referrals/`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard/`),
        ])

        setProfile(await p.json())
        setReferrals(await r.json())
        setLeaderboard(await l.json())
      } catch {
        toast({
          title: "Error",
          description: "Failed to load referral data",
        })
      } finally {
        setPageLoading(false)
      }
    }

    fetchAll()
  }, [authLoading, isAuthenticated, router, toast])

  /* ================= LOADING ================= */

  if (authLoading || pageLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading referral dashboard…
      </div>
    )
  }

  /* ================= SHARE LOGIC ================= */

  const referralLink =
  `www.sssupplement.com/login?ref=${profile.referral_code}`

  const shareText = "Join using my referral link and earn rewards 🎉"

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `${shareText}\n${referralLink}`
    )}`
    window.open(url, "_blank")
  }

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      referralLink
    )}&text=${encodeURIComponent(shareText)}`
    window.open(url, "_blank")
  }

  const shareMessenger = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      referralLink
    )}`
    window.open(url, "_blank")
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink)
    toast({ title: "Copied!", description: "Referral link copied" })
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-10 space-y-10 max-w-4xl">

        {/* HEADER */}
        <div className="text-center">
          <Gift className="h-10 w-10 mx-auto mb-2 text-primary" />
          <h1 className="text-3xl font-bold">Referral Dashboard</h1>
          <p className="text-muted-foreground">
            Share your link & earn points 🚀
          </p>
        </div>

        {/* POINTS */}
        <Card>
          <CardContent className="p-6 text-center">
            <Coins className="mx-auto mb-2" />
            <p className="text-3xl font-bold">{profile.points}</p>
            <p className="text-muted-foreground">Your Points</p>
          </CardContent>
        </Card>

        {/* SHARE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" /> Share Referral
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={shareWhatsApp}>WhatsApp</Button>
            <Button onClick={shareTelegram}>Telegram</Button>
            <Button onClick={shareMessenger}>Messenger</Button>
            <Button variant="outline" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" /> Copy Link
            </Button>
          </CardContent>
        </Card>

        {/* MY REFERRALS */}
        <Card>
          <CardHeader>
            <CardTitle>My Referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {referrals.length === 0 ? (
              <p className="text-muted-foreground">No referrals yet</p>
            ) : (
              referrals.map((ref) => (
                <div key={ref.id} className="flex justify-between text-sm">
                  <span>{ref.referee_name || ref.referee_phone}</span>
                  <span className="text-muted-foreground">
                    +{ref.referrer_points_awarded} pts
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* LEADERBOARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.map((u, i) => (
              <div key={u.id} className="flex justify-between text-sm">
                <span>#{i + 1} {u.name}</span>
                <span>{u.points}</span>
              </div>
            ))}
          </CardContent>
        </Card>

      </main>

      <Footer />
    </div>
  )
}
