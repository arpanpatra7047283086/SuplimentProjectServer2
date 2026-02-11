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
  images: string[]
  flavors: { name: string; price: number }[] 
  weight?: string
  weights: string[]
  description: string
  keyBenefits: string[]
  nutritionalInfo: string
  inStock: boolean
}
