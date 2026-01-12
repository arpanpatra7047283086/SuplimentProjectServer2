"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/context/product-context"

interface RelatedProductsProps {
  products: Product[]
  title?: string
  subtitle?: string
}

export function RelatedProducts({
  products,
  title = "Related Products",
  subtitle = "Based on what you're viewing",
}: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (products.length === 0) return null

  return (
    <section className="mt-12 bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="rounded-full h-10 w-10 border-border hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="rounded-full h-10 w-10 border-border hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[220px] md:w-[250px]" style={{ scrollSnapAlign: "start" }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-4 pt-4 border-t border-border">
        <a href="/products" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
          View All Products
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
