"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ChevronRight } from "lucide-react"

export default function CategoryPage() {
  const params = useParams()
  const category = decodeURIComponent(params.slug as string)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary">
            Home
          </a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{category}</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-8">{category}</h1>

        <ProductGrid category={category} />
      </main>
      <Footer />
    </div>
  )
}
