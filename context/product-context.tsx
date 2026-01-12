"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviews: number
  image: string
  image1?: string
  image2?: string
  image3?: string
  images: string[] // computed from image, image1, image2, image3
  flavors: { name: string; price: number }[] | string
  weight?: string
  weights: string[]
  description: string
  keyBenefits: string[]
  nutritionalInfo: string
  inStock: boolean
}

interface ProductContextType {
  products: Product[]
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProductsByCategory: (category: string) => Product[]
  getProductById: (id: string) => Product | undefined
  searchProducts: (query: string) => Product[]
}

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Optimum Nutrition Gold Standard",
    brand: "Optimum Nutrition",
    category: "Whey Protein",
    price: 2499,
    originalPrice: 2874,
    discount: 15,
    rating: 4.5,
    reviews: 12800,
    image: "/whey-protein-gold-standard.jpg",
    image1: "/whey-protein-side-view.jpg",
    image2: "/whey-protein-nutrition-facts.jpg",
    image3: "/whey-protein-scoop.jpg",
    images: [],
    flavors: [
      { name: "Double Rich Chocolate", price: 2499 },
      { name: "Vanilla Ice Cream", price: 2499 },
      { name: "Cookies & Cream", price: 2599 },
    ],
    weight: "2LB/907GM",
    weights: ["2LB/907GM", "5LB/2.27KG", "10LB/4.54KG"],
    description:
      "Optimum Nutrition Gold Standard 100% Whey delivers 24g of protein per serving with 5.5g of BCAAs and 4g of glutamine & glutamic acid.",
    keyBenefits: [
      "24g of premium protein per serving",
      "5.5g of naturally occurring BCAAs",
      "4g of glutamine & glutamic acid",
      "Fast-absorbing whey protein isolates",
    ],
    nutritionalInfo: "Per Serving (30.4g): Calories 120, Protein 24g, Carbs 3g, Fat 1.5g",
    inStock: true,
  },
  {
    id: "2",
    name: "Creatine Monohydrate",
    brand: "MuscleBlaze",
    category: "Creatine",
    price: 1199,
    originalPrice: 1379,
    discount: 15,
    rating: 4.6,
    reviews: 8500,
    image: "/creatine-monohydrate-powder.jpg",
    image1: "/creatine-supplement.jpg",
    image2: "/creatine-powder-scoop.jpg",
    image3: "/creatine-nutrition-label.jpg",
    images: [],
    flavors: [{ name: "Unflavoured", price: 1199 }],
    weight: "250GM",
    weights: ["250GM", "400GM"],
    description:
      "MuscleBlaze Creatine Monohydrate provides pure micronized creatine for enhanced strength and power output.",
    keyBenefits: [
      "Increases muscle strength & power",
      "Enhances workout performance",
      "Supports muscle recovery",
      "100% pure micronized creatine",
    ],
    nutritionalInfo: "Per Serving (3g): Creatine Monohydrate 3g",
    inStock: true,
  },
  {
    id: "3",
    name: "Super Gainer XXL",
    brand: "MuscleBlaze",
    category: "Mass Gainer",
    price: 2999,
    originalPrice: 3449,
    discount: 15,
    rating: 4.3,
    reviews: 6200,
    image: "/mass-gainer-protein.jpg",
    image1: "/mass-gainer-chocolate.jpg",
    image2: "/mass-gainer-shake.jpg",
    image3: "/mass-gainer-nutrition.jpg",
    images: [],
    flavors: [
      { name: "Chocolate", price: 2999 },
      { name: "Vanilla", price: 2999 },
    ],
    weight: "3KG",
    weights: ["3KG", "5KG"],
    description:
      "MuscleBlaze Super Gainer XXL is engineered to deliver massive gains with high-quality protein and complex carbs.",
    keyBenefits: [
      "High calorie formula for mass gain",
      "Complex carbs for sustained energy",
      "Added digestive enzymes",
      "Supports muscle recovery",
    ],
    nutritionalInfo: "Per Serving (150g): Calories 560, Protein 30g, Carbs 100g, Fat 5g",
    inStock: true,
  },
  {
    id: "4",
    name: "Daily Multivitamin",
    brand: "GNC",
    category: "Multivitamin",
    price: 899,
    originalPrice: 1034,
    discount: 15,
    rating: 4.4,
    reviews: 4500,
    image: "/multivitamin-tablets-bottle.jpg",
    image1: "/vitamin-supplement.png",
    image2: "/multivitamin-pills.png",
    image3: "/health-vitamins.jpg",
    images: [],
    flavors: [{ name: "Unflavoured", price: 899 }],
    weight: "60 Tablets",
    weights: ["60 Tablets", "120 Tablets"],
    description:
      "GNC Daily Multivitamin provides essential vitamins and minerals to support overall health and immunity.",
    keyBenefits: [
      "Complete daily nutrition",
      "Supports immune system",
      "Enhances energy levels",
      "Promotes overall wellness",
    ],
    nutritionalInfo: "Per Tablet: Vitamin A 900mcg, Vitamin C 90mg, Vitamin D 20mcg, Zinc 11mg",
    inStock: true,
  },
  {
    id: "5",
    name: "Pre Workout Igniter",
    brand: "MuscleBlaze",
    category: "Pre Workout",
    price: 1499,
    originalPrice: 1724,
    discount: 15,
    rating: 4.5,
    reviews: 5800,
    image: "/pre-workout-energy-drink.jpg",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/gym-energy-booster.jpg",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [
      { name: "Cola Frost", price: 1499 },
      { name: "Fruit Punch", price: 1499 },
      { name: "Blue Raspberry", price: 1599 },
    ],
    weight: "300GM",
    weights: ["300GM", "450GM"],
    description: "MuscleBlaze Pre Workout Igniter delivers explosive energy and focus for intense training sessions.",
    keyBenefits: ["Explosive energy & focus", "Enhanced muscle pumps", "Increased endurance", "Zero crash formula"],
    nutritionalInfo: "Per Serving (10g): Caffeine 200mg, Beta-Alanine 2g, Citrulline 3g",
    inStock: true,
  },
  {
    id: "6",
    name: "Fat Burner Pro",
    brand: "MuscleBlaze",
    category: "Weight Loss",
    price: 1299,
    originalPrice: 1494,
    discount: 15,
    rating: 4.2,
    reviews: 3200,
    image: "/placeholder.svg?height=300&width=300",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/placeholder.svg?height=400&width=400",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [{ name: "Unflavoured", price: 1299 }],
    weight: "60 Capsules",
    weights: ["60 Capsules", "90 Capsules"],
    description: "MuscleBlaze Fat Burner Pro helps accelerate fat loss while preserving lean muscle mass.",
    keyBenefits: ["Accelerates fat burning", "Boosts metabolism", "Preserves lean muscle", "Natural ingredients"],
    nutritionalInfo: "Per Capsule: Green Tea Extract 500mg, L-Carnitine 250mg, Garcinia 200mg",
    inStock: true,
  },
  {
    id: "7",
    name: "BCAA Recovery",
    brand: "Optimum Nutrition",
    category: "Recovery",
    price: 1599,
    originalPrice: 1839,
    discount: 15,
    rating: 4.6,
    reviews: 4100,
    image: "/placeholder.svg?height=300&width=300",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/placeholder.svg?height=400&width=400",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [
      { name: "Fruit Punch", price: 1599 },
      { name: "Watermelon", price: 1599 },
    ],
    weight: "300GM",
    weights: ["300GM", "450GM"],
    description: "ON BCAA Recovery provides essential amino acids in the optimal 2:1:1 ratio for muscle recovery.",
    keyBenefits: [
      "Optimal 2:1:1 BCAA ratio",
      "Reduces muscle soreness",
      "Supports muscle recovery",
      "Prevents muscle breakdown",
    ],
    nutritionalInfo: "Per Serving (7g): L-Leucine 2.5g, L-Isoleucine 1.25g, L-Valine 1.25g",
    inStock: true,
  },
  {
    id: "8",
    name: "Intra Workout Fuel",
    brand: "MuscleBlaze",
    category: "Intra Workout",
    price: 1099,
    originalPrice: 1264,
    discount: 15,
    rating: 4.3,
    reviews: 2800,
    image: "/placeholder.svg?height=300&width=300",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/placeholder.svg?height=400&width=400",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [
      { name: "Orange", price: 1099 },
      { name: "Lemon Lime", price: 1099 },
    ],
    weight: "400GM",
    weights: ["400GM", "600GM"],
    description: "MuscleBlaze Intra Workout Fuel keeps you hydrated and energized during intense training.",
    keyBenefits: [
      "Sustained energy during workouts",
      "Enhanced hydration",
      "Electrolyte replenishment",
      "Delays fatigue",
    ],
    nutritionalInfo: "Per Serving (15g): Carbs 10g, Electrolytes 500mg, BCAAs 3g",
    inStock: true,
  },
  {
    id: "9",
    name: "High Protein Peanut Butter",
    brand: "MuscleBlaze",
    category: "Peanut Butter & Oats",
    price: 549,
    originalPrice: 632,
    discount: 15,
    rating: 4.5,
    reviews: 9200,
    image: "/placeholder.svg?height=300&width=300",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/placeholder.svg?height=400&width=400",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [
      { name: "Crunchy", price: 549 },
      { name: "Smooth", price: 549 },
      { name: "Chocolate", price: 599 },
    ],
    weight: "750GM",
    weights: ["750GM", "1KG"],
    description: "MuscleBlaze High Protein Peanut Butter is made with roasted peanuts and added whey protein.",
    keyBenefits: ["30g protein per 100g", "No added sugar", "Rich in healthy fats", "Great taste"],
    nutritionalInfo: "Per Serving (32g): Calories 190, Protein 10g, Carbs 6g, Fat 14g",
    inStock: true,
  },
  {
    id: "10",
    name: "Ashwagandha Extract",
    brand: "Himalaya",
    category: "Ayurvedic Products",
    price: 399,
    originalPrice: 459,
    discount: 15,
    rating: 4.4,
    reviews: 6700,
    image: "/placeholder.svg?height=300&width=300",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/placeholder.svg?height=400&width=400",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [{ name: "Unflavoured", price: 399 }],
    weight: "60 Capsules",
    weights: ["60 Capsules", "120 Capsules"],
    description: "Himalaya Ashwagandha Extract helps reduce stress and supports overall vitality.",
    keyBenefits: [
      "Reduces stress & anxiety",
      "Improves energy levels",
      "Supports hormonal balance",
      "Natural adaptogen",
    ],
    nutritionalInfo: "Per Capsule: Ashwagandha Root Extract 300mg (KSM-66)",
    inStock: true,
  },
  {
    id: "11",
    name: "Protein Bar Pack",
    brand: "MuscleBlaze",
    category: "Protein Bars & Snacks",
    price: 299,
    originalPrice: 344,
    discount: 15,
    rating: 4.3,
    reviews: 5400,
    image: "/placeholder.svg?height=300&width=300",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/placeholder.svg?height=400&width=400",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [
      { name: "Chocolate Brownie", price: 299 },
      { name: "Peanut Butter", price: 299 },
      { name: "Cookies & Cream", price: 319 },
    ],
    weight: "6 Pack",
    weights: ["6 Pack", "12 Pack"],
    description: "MuscleBlaze Protein Bars deliver 20g protein in a delicious, convenient snack format.",
    keyBenefits: ["20g protein per bar", "Low sugar", "On-the-go nutrition", "Great taste"],
    nutritionalInfo: "Per Bar (60g): Calories 220, Protein 20g, Carbs 22g, Fat 7g",
    inStock: true,
  },
  {
    id: "12",
    name: "Gym Shaker Bottle",
    brand: "SS Supplement",
    category: "Accessories",
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.6,
    reviews: 3800,
    image: "/placeholder.svg?height=300&width=300",
    image1: "/placeholder.svg?height=400&width=400",
    image2: "/placeholder.svg?height=400&width=400",
    image3: "/placeholder.svg?height=400&width=400",
    images: [],
    flavors: [
      { name: "Black", price: 299 },
      { name: "Red", price: 299 },
      { name: "Blue", price: 299 },
    ],
    weight: "600ML",
    weights: ["600ML", "800ML"],
    description: "SS Supplement Gym Shaker Bottle with leak-proof lid and blender ball for smooth shakes.",
    keyBenefits: ["Leak-proof design", "BPA-free material", "Easy to clean", "Includes blender ball"],
    nutritionalInfo: "N/A",
    inStock: true,
  },
]

// Helper function to build images array from individual image fields
const buildImagesArray = (product: Product): string[] => {
  const images: string[] = []
  if (product.image) images.push(product.image)
  if (product.image1) images.push(product.image1)
  if (product.image2) images.push(product.image2)
  if (product.image3) images.push(product.image3)
  return images
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProductsState] = useState<Product[]>([])

  useEffect(() => {
    const storedProducts = localStorage.getItem("ss_products")
    if (storedProducts) {
      const parsed = JSON.parse(storedProducts)
      // Build images array for each product
      const productsWithImages = parsed.map((p: Product) => ({
        ...p,
        images: buildImagesArray(p),
      }))
      setProductsState(productsWithImages)
    } else {
      const productsWithImages = defaultProducts.map((p) => ({
        ...p,
        images: buildImagesArray(p),
      }))
      setProductsState(productsWithImages)
      localStorage.setItem("ss_products", JSON.stringify(productsWithImages))
    }
  }, [])

  const setProducts = (newProducts: Product[]) => {
    const productsWithImages = newProducts.map((p) => ({
      ...p,
      images: buildImagesArray(p),
    }))
    setProductsState(productsWithImages)
    localStorage.setItem("ss_products", JSON.stringify(productsWithImages))
  }

  const addProduct = (product: Product) => {
    const productWithImages = {
      ...product,
      images: buildImagesArray(product),
    }
    const newProducts = [...products, productWithImages]
    setProducts(newProducts)
  }

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    const newProducts = products.map((p) => {
      if (p.id === id) {
        const updated = { ...p, ...updatedData }
        return { ...updated, images: buildImagesArray(updated) }
      }
      return p
    })
    setProducts(newProducts)
  }

  const deleteProduct = (id: string) => {
    const newProducts = products.filter((p) => p.id !== id)
    setProducts(newProducts)
  }

  const getProductsByCategory = (category: string) => {
    if (category === "All") return products
    return products.filter((p) => p.category === category)
  }

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id)
  }

  const searchProducts = (query: string) => {
    if (!query.trim()) return products
    const searchTerms = query.toLowerCase().split(" ")
    return products.filter((product) => {
      const flavorText = Array.isArray(product.flavors)
        ? product.flavors.map((f) => (typeof f === "string" ? f : f.name)).join(" ")
        : product.flavors
      const searchableText =
        `${product.name} ${product.brand} ${product.category} ${flavorText} ${product.weight || ""}`.toLowerCase()
      return searchTerms.every((term) => searchableText.includes(term))
    })
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductsByCategory,
        getProductById,
        searchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error("useProducts must be used within ProductProvider")
  }
  return context
}
