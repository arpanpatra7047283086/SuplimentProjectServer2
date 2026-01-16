"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, User, Menu, X, ChevronDown, Phone, MessageCircle, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchResults } from "@/components/search-results"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const categories = [
  "Whey Protein",
  "Creatine",
  "Mass Gainer",
  "Multivitamin",
  "Pre Workout",
  "Weight Loss",
  "Recovery",
  "Intra Workout",
  "Peanut Butter & Oats",
  "Ayurvedic Products",
  "Protein Bars & Snacks",
  "Accessories",
  "Minerals & Health",
  "Beauty",
  "Fish Oil",
  
]

const stores = ["Delhi NCR", "Mumbai", "Bangalore", "Pune", "Chennai"]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { getCartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              +91 98765 43210
            </span>
            <span className="hidden md:block">Free Shipping on orders above ₹999</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/referral" className="flex items-center gap-1 hover:underline">
              <Gift className="h-3 w-3" />
              Refer & Earn
            </Link>
            <span className="hidden sm:block">100% Authentic Products</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">SS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">SS Supplement</h1>
              <p className="text-xs text-muted-foreground">Your Fitness Partner</p>
            </div>
          </Link>

          <div className="flex-1 max-w-xl hidden md:block">
            <SearchResults />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/referral">Refer & Earn</Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}

            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-border hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto py-2">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-primary">
                    ALL PRODUCTS
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border w-56">
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat} asChild>
                      <Link href={`/category/${encodeURIComponent(cat)}`}>{cat}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Link href="/offers">
                <Button variant="ghost" size="sm" className="text-primary font-semibold">
                  OFFERS
                </Button>
              </Link>
            </li>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-primary">
                    STORES
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border">
                  {stores.map((store) => (
                    <DropdownMenuItem key={store}>{store}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Link href="/our-story">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  OUR STORY
                </Button>
              </Link>
            </li>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-primary">
                    AUTHENTICITY
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border">
                  <DropdownMenuItem>Verify Product</DropdownMenuItem>
                  <DropdownMenuItem>Our Certifications</DropdownMenuItem>
                  <DropdownMenuItem>Lab Reports</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Link href="/chat-support">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary gap-1">
                  <MessageCircle className="h-4 w-4" />
                  CHAT SUPPORT
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/business-enquiry">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  BUSINESS ENQUIRY
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="mb-4">
              <SearchResults onClose={() => setMobileMenuOpen(false)} />
            </div>

            <ul className="space-y-2">
              <li>
                <Link href="/offers" className="block py-2 text-primary font-semibold">
                  OFFERS
                </Link>
              </li>
              <li>
                <Link href="/referral" className="block py-2 text-foreground flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  REFER & EARN
                </Link>
              </li>
              <li>
                <Link href="/our-story" className="block py-2 text-foreground">
                  OUR STORY
                </Link>
              </li>
              <li>
                <Link href="/chat-support" className="block py-2 text-foreground">
                  CHAT SUPPORT
                </Link>
              </li>
              <li>
                <Link href="/business-enquiry" className="block py-2 text-foreground">
                  BUSINESS ENQUIRY
                </Link>
              </li>
              <li className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/category/${encodeURIComponent(cat)}`}
                      className="text-sm py-1 text-foreground hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}
