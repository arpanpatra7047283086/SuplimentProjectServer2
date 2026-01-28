"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ChevronRight, Filter, X } from "lucide-react"
import { useProducts } from "@/context/product-context"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function CategoryPage() {
  const params = useParams()
  const category = decodeURIComponent(params.slug as string)
  const { getProductsByCategory } = useProducts()
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  // Get unique brands for the current category
  const brands = useMemo(() => {
    const categoryProducts = getProductsByCategory(category)
    const uniqueBrands = [...new Set(categoryProducts.map((p) => p.brand))]
    return uniqueBrands.sort()
  }, [category, getProductsByCategory])

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands((prev) => [...prev, brand])
    } else {
      setSelectedBrands((prev) => prev.filter((b) => b !== brand))
    }
  }

  const clearFilters = () => {
    setSelectedBrands([])
  }

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Brands</h3>
        {selectedBrands.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {brands.map((brand) => (
          <div key={brand} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand}`}
              checked={selectedBrands.includes(brand)}
              onCheckedChange={(checked) =>
                handleBrandChange(brand, checked as boolean)
              }
            />
            <Label
              htmlFor={`brand-${brand}`}
              className="text-sm font-normal cursor-pointer"
            >
              {brand}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )

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

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">{category}</h1>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {selectedBrands.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {selectedBrands.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Selected Filters Tags */}
        {selectedBrands.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {brand}
                <button
                  onClick={() => handleBrandChange(brand, false)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border rounded-lg p-4">
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid category={category} selectedBrands={selectedBrands} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
