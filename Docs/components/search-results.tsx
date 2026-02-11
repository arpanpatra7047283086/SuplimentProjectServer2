"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/context/product-context"

interface SearchResultsProps {
  onClose?: () => void
}

export function SearchResults({ onClose }: SearchResultsProps) {
  const { products } = useProducts()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState(products.slice(0, 5))
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredProducts(products.slice(0, 5))
    } else {
      const searchTerms = query.toLowerCase().split(" ")
      const results = products.filter((product) => {
        const searchableText =
          `${product.name} ${product.brand} ${product.category} ${product.flavors?.map((f) => (typeof f === "string" ? f : f.name)).join(" ")}`.toLowerCase()
        return searchTerms.every((term) => searchableText.includes(term))
      })
      setFilteredProducts(results.slice(0, 8))
    }
  }, [query, products])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProductClick = () => {
    setIsOpen(false)
    setQuery("")
    onClose?.()
  }

  const popularSearches = ["Whey Protein", "Creatine", "Mass Gainer", "Pre Workout", "BCAA"]

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search for products, brands and more..."
          className="pl-10 pr-10 bg-secondary border-border"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <TrendingUp className="h-4 w-4" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="px-3 py-1 bg-secondary rounded-full text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">Trending Products</p>
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={handleProductClick}
                      className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <div className="relative w-12 h-12 bg-secondary rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary">₹{product.price}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 py-1">
                {filteredProducts.length} result{filteredProducts.length > 1 ? "s" : ""} for "{query}"
              </p>
              <div className="space-y-1">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={handleProductClick}
                    className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <div className="relative w-14 h-14 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand} • {product.category}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-foreground">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
                            <span className="text-xs text-success">{product.discount}% off</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={handleProductClick}
                className="block text-center text-sm text-primary hover:underline py-3 border-t border-border mt-2"
              >
                View all results for "{query}"
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-2">No products found for "{query}"</p>
              <p className="text-sm text-muted-foreground">Try searching for something else</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
