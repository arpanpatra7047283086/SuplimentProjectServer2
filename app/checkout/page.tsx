"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, CreditCard, Banknote, Check, Loader2, QrCode, Copy, CheckCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

// Admin WhatsApp number (change this to your actual number)
const ADMIN_WHATSAPP = "919876543210"
const ADMIN_UPI_ID = "sssupplement@upi"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getCartTotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [utrNumber, setUtrNumber] = useState("")
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const copyUpiId = () => {
    navigator.clipboard.writeText(ADMIN_UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateOrderMessage = () => {
    const orderItems = items
      .map((item) => {
        const price =
          typeof item.product.flavors === "string"
            ? item.product.price
            : item.product.flavors.find((f) => f.name === item.selectedFlavor)?.price || item.product.price
        return `• ${item.product.name} (${item.selectedFlavor}, ${item.selectedWeight}) x${item.quantity} = ₹${price * item.quantity}`
      })
      .join("\n")

    const message = `
🛒 *NEW ORDER - SS Supplement*

📦 *Order Details:*
${orderItems}

💰 *Total Amount:* ₹${getCartTotal()}

👤 *Customer Details:*
Name: ${formData.fullName}
Phone: ${formData.phone}
Email: ${formData.email}

📍 *Delivery Address:*
${formData.address}
${formData.landmark ? `Landmark: ${formData.landmark}` : ""}
${formData.city}, ${formData.state} - ${formData.pincode}

💳 *Payment Method:* ${paymentMethod === "upi" ? `UPI Payment\nUTR Number: ${utrNumber}` : "Cash on Delivery"}

---
Order Time: ${new Date().toLocaleString("en-IN")}
    `.trim()

    return encodeURIComponent(message)
  }

  const handleProceedToPayment = () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "upi") {
      setShowQRCode(true)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (paymentMethod === "upi" && !utrNumber.trim()) {
      toast({
        title: "UTR Number Required",
        description: "Please enter the UTR/Transaction number after payment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate WhatsApp message and open WhatsApp
    const message = generateOrderMessage()
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank")

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem("ss_orders") || "[]")
    const newOrder = {
      id: `ORD${Date.now()}`,
      items: items.map((item) => ({
        productId: item.product.id,
        product: item.product.name,
        flavor: item.selectedFlavor,
        weight: item.selectedWeight,
        quantity: item.quantity,
        price:
          typeof item.product.flavors === "string"
            ? item.product.price
            : item.product.flavors.find((f) => f.name === item.selectedFlavor)?.price || item.product.price,
      })),
      total: getCartTotal(),
      address: formData,
      paymentMethod,
      utrNumber: paymentMethod === "upi" ? utrNumber : null,
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: user?.id || "guest",
      userName: formData.fullName,
      userPhone: formData.phone,
    }
    orders.push(newOrder)
    localStorage.setItem("ss_orders", JSON.stringify(orders))

    clearCart()
    setOrderPlaced(true)
    setIsSubmitting(false)
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=/checkout")
    return null
  }

  if (items.length === 0 && !orderPlaced) {
    router.push("/cart")
    return null
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Your order details have been sent to our WhatsApp. We will confirm your order shortly.
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/orders")} className="w-full bg-primary hover:bg-primary/90">
                View My Orders
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (showQRCode) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground flex items-center justify-center gap-2">
                  <QrCode className="h-6 w-6 text-primary" />
                  Pay via UPI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl mx-auto w-fit">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${ADMIN_UPI_ID}&pn=SS%20Supplement&am=${getCartTotal()}&cu=INR`}
                    alt="UPI QR Code"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-3xl font-bold text-primary">₹{getCartTotal()}</p>
                </div>

                {/* UPI ID */}
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Or pay using UPI ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-foreground font-mono text-lg">{ADMIN_UPI_ID}</code>
                    <Button variant="outline" size="sm" onClick={copyUpiId}>
                      {copied ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* UTR Input */}
                <div className="space-y-2">
                  <Label htmlFor="utr" className="text-foreground">
                    Enter UTR/Transaction Number *
                  </Label>
                  <Input
                    id="utr"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Enter 12-digit UTR number"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can find UTR number in your UPI app transaction history
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowQRCode(false)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !utrNumber.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Payment"
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  After payment, enter UTR number and click Confirm to complete your order
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-secondary border-border"
                    placeholder="House No., Building, Street, Area"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="bg-secondary border-border"
                    placeholder="Near temple, opposite mall, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </div>
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <QrCode className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">UPI Payment (QR Code)</p>
                        <p className="text-sm text-muted-foreground">Scan QR code to pay instantly</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const price =
                      typeof item.product.flavors === "string"
                        ? item.product.price
                        : item.product.flavors.find((f) => f.name === item.selectedFlavor)?.price || item.product.price

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedFlavor}-${item.selectedWeight}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.selectedFlavor} • {item.selectedWeight}
                          </p>
                          <p className="text-sm text-foreground">
                            ₹{price} x {item.quantity} = ₹{price * item.quantity}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-success">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹{getCartTotal()}</span>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToPayment}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {paymentMethod === "upi" ? "Proceed to Pay" : "Place Order"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
