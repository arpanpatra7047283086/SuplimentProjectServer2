"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryBar } from "@/components/category-bar"
import { ProductGrid } from "@/components/product-grid"
import { OffersBanner } from "@/components/offers-banner"

export default function HomePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!apiBase) {
      return
    }

    fetch(`${apiBase}/api/wake-up/`)
      .then(() => console.log("Backend wake-up call sent"))
      .catch(() => console.log("Backend sleeping... waking up"))
  }, [apiBase])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <CategoryBar />
        <OffersBanner />

        <div className="container mx-auto px-4">
          <ProductGrid title="Featured Products" shuffle={true} limit={10} />

          <section className="py-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Shop by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Whey Protein", "Pre Workout", "Mass Gainer"].map((cat) => (
                <a
                  key={cat}
                  href={`/category/${encodeURIComponent(cat)}`}
                  className="relative h-48 rounded-xl overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">{cat}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <ProductGrid title="Best Sellers" limit={5} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
