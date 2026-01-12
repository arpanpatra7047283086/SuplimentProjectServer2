import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Award, Users, Heart } from "lucide-react"

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-accent py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Story</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Building a healthier India, one supplement at a time
            </p>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">Who We Are</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                SS Supplement was founded with a simple mission: to make premium quality health supplements accessible
                to every fitness enthusiast in India. We believe that everyone deserves access to authentic, lab-tested
                supplements that can help them achieve their fitness goals.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Starting from a small shop in Gurgaon, we have grown to become one of the most trusted names in the
                supplement industry. Our commitment to authenticity, quality, and customer satisfaction has helped us
                build a loyal community of fitness enthusiasts across the country.
              </p>

              {/* Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">100% Authentic</h3>
                    <p className="text-sm text-muted-foreground">
                      Every product is sourced directly from authorized distributors
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Quality Assured</h3>
                    <p className="text-sm text-muted-foreground">Lab-tested products with verified certifications</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Expert Support</h3>
                    <p className="text-sm text-muted-foreground">Our team of fitness experts is always here to help</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Customer First</h3>
                    <p className="text-sm text-muted-foreground">Your satisfaction is our top priority</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
