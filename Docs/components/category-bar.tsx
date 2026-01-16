"use client"


import Link from "next/link"
import {
  Dumbbell,
  Pill,
  Scale,
  Heart,
  Zap,
  Flame,
  RefreshCw,
  Droplet,
  Cookie,
  Leaf,
  Candy,
  ShoppingBag,
  Sparkles,
  HeartPulse,
  ShieldPlus,
} from "lucide-react"

const categories = [
  { name: "Whey Protein", icon: Dumbbell },
  { name: "Creatine", icon: Pill },
  { name: "Mass Gainer", icon: Scale },
  { name: "Multivitamin", icon: Heart },
  { name: "Pre Workout", icon: Zap },
  { name: "Weight Loss", icon: Flame },
  { name: "Recovery", icon: RefreshCw },
  { name: "Intra Workout", icon: Droplet },
  { name: "Peanut Butter & Oats", icon: Cookie },
  { name: "Ayurvedic Products", icon: Leaf },
  { name: "Protein Bars & Snacks", icon: Candy },
  { name: "Accessories", icon: ShoppingBag },
 { name: "Beauty", icon: Sparkles },
 { name: "Fish Oil", icon: HeartPulse },
  { name: "Minerals & Health", icon: ShieldPlus },



]

export function CategoryBar() {
  return (
    <section className="py-6 bg-secondary/30 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                  <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
