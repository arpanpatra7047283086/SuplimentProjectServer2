import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ProductProvider } from "@/context/product-context"
import { CartProvider } from "@/context/cart-context"
import { AuthProvider } from "@/context/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SS Supplement - Premium Health & Fitness Supplements",
  description:
    "Your one-stop destination for 100% authentic health supplements. Shop Whey Protein, Creatine, Mass Gainers, Pre-Workout & more from top brands.",
  keywords: ["supplements", "whey protein", "creatine", "mass gainer", "fitness", "health", "gym"],
  generator: "SS Supplement",
  icons: {
    icon: [
      {
        url: "/ss-supplements-logo-rounded.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/ss-supplements-logo-rounded.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/ss-supplements-logo-rounded.png",
        type: "image/png",
      },
    ],
    apple: "/ss-supplements-logo-rounded.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#e05a00",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
