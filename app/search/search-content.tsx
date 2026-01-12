"use client"

import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useProducts } from "@/context/product-context"

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { searchProducts } = useProducts()

  const results = searchProducts(query)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No products found for "{query}"</p>
            <p className="text-muted-foreground">Try searching with different keywords</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
