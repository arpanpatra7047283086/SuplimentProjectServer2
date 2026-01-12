"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "./product-context"

export interface CartItem {
  product: Product
  quantity: number
  selectedFlavor: string
  selectedWeight: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, flavor: string, weight: string, quantity?: number) => void
  removeFromCart: (productId: string, flavor: string, weight: string) => void
  updateQuantity: (productId: string, flavor: string, weight: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const storedCart = localStorage.getItem("ss_cart")
    if (storedCart) {
      setItems(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("ss_cart", JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, flavor: string, weight: string, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedFlavor === flavor && item.selectedWeight === weight,
      )

      if (existingIndex > -1) {
        const newItems = [...prev]
        newItems[existingIndex].quantity += quantity
        return newItems
      }

      return [...prev, { product, quantity, selectedFlavor: flavor, selectedWeight: weight }]
    })
  }

  const removeFromCart = (productId: string, flavor: string, weight: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedFlavor === flavor && item.selectedWeight === weight),
      ),
    )
  }

  const updateQuantity = (productId: string, flavor: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, flavor, weight)
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedFlavor === flavor && item.selectedWeight === weight
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const flavorPrice = item.product.flavors.find((f) => f.name === item.selectedFlavor)?.price || item.product.price
      return total + flavorPrice * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
