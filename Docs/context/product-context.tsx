"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Product } from "@/app/types/product"
import { products as defaultProducts } from "@/lib/products"

interface ProductVariant {
  id: string
  flavor: string
  weight: string
  price: number
  originalPrice: number
  image: string
}

interface ProductContextType {
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProductsByCategory: (category: string) => Product[]
  getProductById: (id: string) => Product | undefined
  searchProducts: (query: string) => Product[]
  getProductVariants: (productName: string, brand: string) => ProductVariant[]
  findProductByVariant: (productName: string, brand: string, flavor: string, weight: string) => Product | undefined
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)


const buildImagesArray = (p: Product): string[] =>
  [p.image, p.image1, p.image2, p.image3].filter(Boolean) as string[]

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(
    defaultProducts.map((p) => ({
      ...p,
      images: buildImagesArray(p),
      flavors: Array.isArray(p.flavors) ? p.flavors : [], // SAFETY
    }))
  )

  const addProduct = (product: Product) => {
    setProducts((prev) => [
      ...prev,
      { ...product, images: buildImagesArray(product) },
    ])
  }

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...data, images: buildImagesArray({ ...p, ...data } as Product) }
          : p
      )
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const getProductsByCategory = (category: string) =>
    category === "All" ? products : products.filter((p) => p.category === category)

  const getProductById = (id: string) =>
    products.find((p) => p.id === id)

  const searchProducts = (query: string) => {
    if (!query.trim()) return products
    const q = query.toLowerCase()

    return products.filter((p) =>
      `${p.name} ${p.brand} ${p.category} ${p.weight ?? ""} ${p.flavors
        .map((f) => f.name)
        .join(" ")}`.toLowerCase().includes(q)
    )
  }

  // Get all variants of a product by name and brand
  const getProductVariants = (productName: string, brand: string): ProductVariant[] => {
    const variants = products
      .filter((p) => p.name === productName && p.brand === brand)
      .map((p) => ({
        id: p.id,
        flavor: p.flavors.length > 0 ? p.flavors[0].name : "",
        weight: p.weight || "",
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
      }))
    return variants
  }

  // Find a specific product by variant (name, brand, flavor, weight)
  const findProductByVariant = (
    productName: string,
    brand: string,
    flavor: string,
    weight: string
  ): Product | undefined => {
    return products.find(
      (p) =>
        p.name === productName &&
        p.brand === brand &&
        p.weight === weight &&
        p.flavors.some((f) => f.name === flavor)
    )
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductsByCategory,
        getProductById,
        searchProducts,
        getProductVariants,
        findProductByVariant,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider")
  return ctx
}
