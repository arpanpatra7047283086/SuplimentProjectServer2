"use client"

import { useMemo } from "react"
import { ProductCard } from "./product-card"
import { useProducts } from "@/context/product-context"

interface ProductGridProps {
  category?: string
  limit?: number
  shuffle?: boolean
  title?: string
}

export function ProductGrid({ category, limit, shuffle = false, title }: ProductGridProps) {
  const { products, getProductsByCategory } = useProducts()

  const displayProducts = useMemo(() => {
    let items = category ? getProductsByCategory(category) : products

    if (shuffle) {
      items = [...items].sort(() => Math.random() - 0.5)
    }

    if (limit) {
      items = items.slice(0, limit)
    }

    return items
  }, [products, category, limit, shuffle, getProductsByCategory])

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found in this category.</p>
      </div>
    )
  }

  return (
    <section className="py-8">
      {title && <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
