import { Tag, Truck, Shield, RefreshCw } from "lucide-react"

const offers = [
  {
    icon: Tag,
    title: "Best Prices",
    description: "Guaranteed lowest prices",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: Shield,
    title: "100% Authentic",
    description: "Verified products only",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
]

export function OffersBanner() {
  return (
    <section className="py-8 bg-primary/5 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {offers.map((offer) => {
            const Icon = offer.icon
            return (
              <div key={offer.title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{offer.title}</h3>
                  <p className="text-xs text-muted-foreground">{offer.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
