import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/ss-supplements-logo.jpeg"
                alt="SS Supplement logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-lg text-foreground">SS Supplement</h3>
                <p className="text-xs text-muted-foreground">Your Fitness Partner</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Your one-stop destination for premium quality health supplements. We offer 100% authentic products from
              top brands.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-muted-foreground hover:text-primary">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-primary">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/Whey Protein" className="text-muted-foreground hover:text-primary">
                  Whey Protein
                </Link>
              </li>
              <li>
                <Link href="/category/Creatine" className="text-muted-foreground hover:text-primary">
                  Creatine
                </Link>
              </li>
              <li>
                <Link href="/category/Mass Gainer" className="text-muted-foreground hover:text-primary">
                  Mass Gainer
                </Link>
              </li>
              <li>
                <Link href="/category/Pre Workout" className="text-muted-foreground hover:text-primary">
                  Pre Workout
                </Link>
              </li>
              <li>
                <Link href="/category/Accessories" className="text-muted-foreground hover:text-primary">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">123 Fitness Street, Sector 14, Gurgaon, Haryana - 122001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">+91 95478 99170</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">info@sssupplement.com</span>
              </li>
            </ul>

            <h4 className="font-semibold text-foreground mb-2">Newsletter</h4>
            <div className="flex gap-2">
              <Input type="email" placeholder="Your email" className="bg-secondary border-border text-sm" />
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 SS Supplement. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-muted-foreground hover:text-primary">
                Shipping Policy
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">FSSAI License:</span>
              <span className="text-xs text-foreground">10015064000576</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
