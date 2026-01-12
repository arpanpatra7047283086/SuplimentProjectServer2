"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const banners = [
  {
    id: 1,
    title: "Mega Protein Sale",
    subtitle: "Up to 40% OFF on Whey Proteins",
    cta: "Shop Now",
    link: "/category/Whey Protein",
    image: "/placeholder.svg?height=500&width=1200",
    gradient: "from-primary/80 to-transparent",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Premium Creatine Collection",
    cta: "Explore",
    link: "/category/Creatine",
    image: "/placeholder.svg?height=500&width=1200",
    gradient: "from-accent/80 to-transparent",
  },
  {
    id: 3,
    title: "Bulk Up Season",
    subtitle: "Mass Gainers Starting ₹1999",
    cta: "Get Started",
    link: "/category/Mass Gainer",
    image: "/placeholder.svg?height=500&width=1200",
    gradient: "from-primary/80 to-transparent",
  },
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)

  return (
    <section className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={banner.image || "/placeholder.svg"}
            alt={banner.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-lg">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 text-balance">{banner.title}</h2>
                <p className="text-lg md:text-xl text-white/90 mb-6">{banner.subtitle}</p>
                <Link href={banner.link}>
                  <Button size="lg" className="bg-white text-background hover:bg-white/90">
                    {banner.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-6" : "bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  )
}
