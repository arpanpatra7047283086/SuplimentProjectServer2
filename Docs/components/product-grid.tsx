"use client"

import { useEffect, useMemo, useState } from "react"
import { ProductCard } from "./product-card"
import { useProducts } from "@/context/product-context"
import type { Product } from "@/app/types/product"

interface ProductGridProps {
  category?: string
  limit?: number
  shuffle?: boolean
  title?: string
  selectedBrands?: string[]
}

export function ProductGrid({
  category,
  limit,
  shuffle = false,
  title,
  selectedBrands = [],
}: ProductGridProps) {
  const { products, getProductsByCategory } = useProducts()
  const [displayProducts, setDisplayProducts] = useState<Product[]>([])

  // ✅ Server-safe filtering
  const baseProducts = useMemo(() => {
    // Ensure getProductsByCategory exists
    let items: Product[] = category && getProductsByCategory
      ? getProductsByCategory(category)
      : products || []

    // Filter by selected brands
    if (selectedBrands.length > 0) {
      items = items.filter((product) => selectedBrands.includes(product.brand))
    }

    if (limit) {
      items = items.slice(0, limit)
    }

    return items
  }, [products, category, limit, getProductsByCategory, selectedBrands])

  // ✅ Client-only shuffle
  useEffect(() => {
    let items = [...baseProducts]

    if (shuffle) {
      // Shuffle array safely
      items.sort(() => Math.random() - 0.5)
    }

    setDisplayProducts(items)
  }, [baseProducts, shuffle])

  // ❌ Empty state
  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No products found{category ? ` in ${category}` : ""}.
        </p>
      </div>
    )
  }

  return (
    <section className="py-8">
      {title && (
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
