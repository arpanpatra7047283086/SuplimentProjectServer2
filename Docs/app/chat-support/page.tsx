"use client"

import { MessageCircle, Phone, Mail, Clock } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ChatSupportPage() {
  const handleWhatsAppChat = () => {
    const message = encodeURIComponent("Hi! I need help with my order/query.")
    window.open(`https://wa.me/919547899170?text=${message}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Chat Support</h1>
          <p className="text-muted-foreground mb-8">
            Need help? Our support team is available to assist you with any queries about products, orders, or general
            assistance.
          </p>

          <Button size="lg" className="bg-success hover:bg-success/90 text-white mb-12" onClick={handleWhatsAppChat}>
            <MessageCircle className="h-5 w-5 mr-2" />
            Chat on WhatsApp
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                <p className="text-muted-foreground text-sm">+91 95478 99170</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                <p className="text-muted-foreground text-sm">support@sssupplement.com</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Working Hours</h3>
                <p className="text-muted-foreground text-sm">10 AM - 8 PM (Mon-Sat)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
