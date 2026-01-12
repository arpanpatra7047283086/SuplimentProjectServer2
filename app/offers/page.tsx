"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Special Offers</h1>
            <p className="text-muted-foreground">Grab the best deals on premium supplements</p>
          </div>
        </div>

        {/* Offer Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white">
            <Badge className="bg-white/20 mb-3">Limited Time</Badge>
            <h2 className="text-2xl font-bold mb-2">Flat 15% OFF</h2>
            <p className="text-white/80">On all Whey Proteins</p>
          </div>
          <div className="bg-gradient-to-r from-success to-primary rounded-xl p-6 text-white">
            <Badge className="bg-white/20 mb-3">New User</Badge>
            <h2 className="text-2xl font-bold mb-2">Extra 10% OFF</h2>
            <p className="text-white/80">On your first order</p>
          </div>
        </div>

        <ProductGrid title="Products on Offer" shuffle={true} />
      </main>
      <Footer />
    </div>
  )
}
