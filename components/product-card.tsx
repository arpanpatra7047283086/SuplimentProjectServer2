"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/context/product-context"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, product.flavors[0].name, product.weights[0])
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden h-full">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-secondary/50 overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
            {product.discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                {product.discount}% OFF
              </Badge>
            )}
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5 bg-success/20 text-success px-1.5 py-0.5 rounded text-xs">
                <span>{product.rating}</span>
                <Star className="h-3 w-3 fill-current" />
              </div>
              <span className="text-xs text-muted-foreground">({(product.reviews / 1000).toFixed(1)}k)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {product.flavors[0].name} • {product.weights[0]}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
