"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  LogOut,
  Download,
  Gift,
  Eye,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useProducts, type Product } from "@/context/product-context"
import { useToast } from "@/hooks/use-toast"

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
]

// Image folder structure for dropdown selection
const imageFolders = [
  { path: "/image/Whey_protien/Optimum", label: "Whey Protein - Optimum Nutrition" },
  { path: "/image/Whey_protien/Dymatize", label: "Whey Protein - Dymatize" },
  { path: "/image/Whey_protien/Labrada", label: "Whey Protein - Labrada" },
  { path: "/image/Whey_protien/MuscleTech", label: "Whey Protein - MuscleTech" },
  { path: "/image/Whey_protien/GncProPerform", label: "Whey Protein - GNC Pro Perform" },
  { path: "/image/Whey_protien/GncPureIsolate", label: "Whey Protein - GNC Pure Isolate" },
  { path: "/image/Whey_protien/GncSelect", label: "Whey Protein - GNC Select" },
  { path: "/image/Whey_protien/BPI", label: "Whey Protein - BPI" },
  { path: "/image/Whey_protien/OneScience", label: "Whey Protein - One Science" },
  { path: "/image/Whey_protien/Isopure", label: "Whey Protein - Isopure" },
  { path: "/image/Whey_protien/MB_performance", label: "Whey Protein - MB Performance" },
  { path: "/image/Whey_protien/MB_Isozero", label: "Whey Protein - MB Isozero" },
  { path: "/image/Creatine", label: "Creatine" },
  { path: "/image/Mass_Gainer", label: "Mass Gainer" },
  { path: "/image/Pre_Workout", label: "Pre Workout" },
  { path: "/image/Multivitamin", label: "Multivitamin" },
  { path: "/image/Accessories", label: "Accessories" },
  { path: "/public", label: "Public Folder" },
]

const defaultProduct: Omit<Product, "id" | "images"> = {
  name: "",
  brand: "",
  category: "Whey Protein",
  price: 0,
  originalPrice: 0,
  discount: 0,
  rating: 4.5,
  reviews: 0,
  image: "",
  image1: "",
  image2: "",
  image3: "",
  flavors: [{ name: "Default", price: 0 }],
  weight: "",
  weights: ["500GM"],
  description: "",
  keyBenefits: [""],
  nutritionalInfo: "",
  inStock: true,
}

interface Order {
  id: string
  items: any[]
  total: number
  address: any
  paymentMethod: string
  utrNumber?: string
  status: string
  createdAt: string
  userId: string
  userName: string
  userPhone: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, logout, getAllUsers } = useAuth()
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("products")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Omit<Product, "id" | "images">>(defaultProduct)
  const [flavorsInput, setFlavorsInput] = useState("")
  const [weightsInput, setWeightsInput] = useState("")
  const [benefitsInput, setBenefitsInput] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!isAdmin) {
      router.push("/login")
    }
    // Load orders and users
    setOrders(JSON.parse(localStorage.getItem("ss_orders") || "[]"))
    setUsers(getAllUsers())
  }, [isAdmin, router, getAllUsers])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({ ...product })
    const flavorStr = Array.isArray(product.flavors)
      ? product.flavors
          .map((f) => (typeof f === "string" ? `${f}:${product.price}` : `${f.name}:${f.price}`))
          .join(", ")
      : `${product.flavors}:${product.price}`
    setFlavorsInput(flavorStr)
    setWeightsInput(product.weights?.join(", ") || product.weight || "")
    setBenefitsInput(product.keyBenefits?.join("\n") || "")
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setFormData(defaultProduct)
    setFlavorsInput("Default:0")
    setWeightsInput("500GM")
    setBenefitsInput("")
    setSelectedFolder("")
    setIsDialogOpen(true)
  }

  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder)
  }

  const applyFolderPath = (imageField: "image" | "image1" | "image2" | "image3") => {
    if (selectedFolder) {
      const fileName = prompt(`Enter image filename (e.g., product_name.webp):`)
      if (fileName) {
        setFormData({ ...formData, [imageField]: `${selectedFolder}/${fileName}` })
      }
    }
  }

  const handleSave = () => {
    // Parse flavors
    const flavors = flavorsInput.split(",").map((f) => {
      const [name, price] = f.trim().split(":")
      return { name: name.trim(), price: Number.parseInt(price) || 0 }
    })

    // Parse weights
    const weights = weightsInput.split(",").map((w) => w.trim())

    // Parse benefits
    const keyBenefits = benefitsInput.split("\n").filter((b) => b.trim())

    const productData = {
      ...formData,
      flavors,
      weights,
      keyBenefits,
      price: flavors[0]?.price || formData.price,
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
      toast({ title: "Success", description: "Product updated successfully" })
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        images: [],
      }
      addProduct(newProduct)
      toast({ title: "Success", description: "Product added successfully" })
    }

    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
      toast({ title: "Success", description: "Product deleted successfully" })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const updateOrderStatus = (orderId: string, status: string) => {
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status } : o))
    setOrders(updatedOrders)
    localStorage.setItem("ss_orders", JSON.stringify(updatedOrders))
    toast({ title: "Success", description: "Order status updated" })
  }

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(",")
    const rows = data.map((item) =>
      Object.values(item)
        .map((v) => (typeof v === "object" ? JSON.stringify(v) : v))
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
  }

  // Calculate stats
  const totalProducts = products.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0)
  const totalUsers = users.length
  const totalReferralCoins = users.reduce((sum, u) => sum + (u.referralCoins || 0), 0)

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-card">
                <Image
                  src="/ss-supplements-logo.jpeg"
                  alt="SS Supplements"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">SS Supplement</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₹{totalRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referral Coins</p>
                  <p className="text-2xl font-bold text-foreground">{totalReferralCoins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Manage Products</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportToCSV(products, "products")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Product Name</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label>Brand</Label>
                            <Input
                              value={formData.brand}
                              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                              className="bg-secondary border-border"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger className="bg-secondary border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Discount (%)</Label>
                            <Input
                              type="number"
                              value={formData.discount}
                              onChange={(e) =>
                                setFormData({ ...formData, discount: Number.parseInt(e.target.value) || 0 })
                              }
                              className="bg-secondary border-border"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Original Price (₹)</Label>
                            <Input
                              type="number"
                              value={formData.originalPrice}
                              onChange={(e) =>
                                setFormData({ ...formData, originalPrice: Number.parseInt(e.target.value) || 0 })
                              }
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label>Rating</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={formData.rating}
                              onChange={(e) =>
                                setFormData({ ...formData, rating: Number.parseFloat(e.target.value) || 0 })
                              }
                              className="bg-secondary border-border"
                            />
                          </div>
                        </div>

                        {/* Image Folder Selection */}
                        <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-primary" />
                            <Label className="text-foreground font-semibold">Image Folder Selection</Label>
                          </div>
                          <Select value={selectedFolder} onValueChange={handleFolderSelect}>
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue placeholder="Select image folder..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border max-h-60">
                              {imageFolders.map((folder) => (
                                <SelectItem key={folder.path} value={folder.path}>
                                  {folder.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedFolder && (
                            <p className="text-xs text-muted-foreground">
                              Selected path: <code className="bg-background px-1 rounded">{selectedFolder}/</code>
                            </p>
                          )}
                        </div>

                        {/* Product Images */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center justify-between">
                              Main Image URL
                              {selectedFolder && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => applyFolderPath("image")}
                                >
                                  Apply Folder
                                </Button>
                              )}
                            </Label>
                            <Input
                              value={formData.image}
                              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                              className="bg-secondary border-border"
                              placeholder="/image/folder/filename.webp"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center justify-between">
                              Image 2 URL
                              {selectedFolder && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => applyFolderPath("image1")}
                                >
                                  Apply Folder
                                </Button>
                              )}
                            </Label>
                            <Input
                              value={formData.image1}
                              onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                              className="bg-secondary border-border"
                              placeholder="/image/folder/filename.webp"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center justify-between">
                              Image 3 URL
                              {selectedFolder && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => applyFolderPath("image2")}
                                >
                                  Apply Folder
                                </Button>
                              )}
                            </Label>
                            <Input
                              value={formData.image2}
                              onChange={(e) => setFormData({ ...formData, image2: e.target.value })}
                              className="bg-secondary border-border"
                              placeholder="/image/folder/filename.webp"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center justify-between">
                              Image 4 URL
                              {selectedFolder && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => applyFolderPath("image3")}
                                >
                                  Apply Folder
                                </Button>
                              )}
                            </Label>
                            <Input
                              value={formData.image3}
                              onChange={(e) => setFormData({ ...formData, image3: e.target.value })}
                              className="bg-secondary border-border"
                              placeholder="/image/folder/filename.webp"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Flavors (format: Name:Price, Name:Price)</Label>
                          <Input
                            value={flavorsInput}
                            onChange={(e) => setFlavorsInput(e.target.value)}
                            className="bg-secondary border-border"
                            placeholder="Chocolate:2499, Vanilla:2499"
                          />
                        </div>
                        <div>
                          <Label>Weights (comma separated)</Label>
                          <Input
                            value={weightsInput}
                            onChange={(e) => setWeightsInput(e.target.value)}
                            className="bg-secondary border-border"
                            placeholder="500GM, 1KG, 2KG"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-secondary border-border"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Key Benefits (one per line)</Label>
                          <Textarea
                            value={benefitsInput}
                            onChange={(e) => setBenefitsInput(e.target.value)}
                            className="bg-secondary border-border"
                            rows={4}
                            placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
                          />
                        </div>
                        <div>
                          <Label>Nutritional Information</Label>
                          <Input
                            value={formData.nutritionalInfo}
                            onChange={(e) => setFormData({ ...formData, nutritionalInfo: e.target.value })}
                            className="bg-secondary border-border"
                            placeholder="Per Serving: Protein 24g, Carbs 3g..."
                          />
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                            <Save className="h-4 w-4 mr-2" />
                            {editingProduct ? "Update" : "Add"} Product
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Product</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Images</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-border hover:bg-secondary/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 bg-secondary rounded overflow-hidden">
                                <Image
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                          <td className="py-3 px-4 text-foreground">₹{product.price}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              {product.images?.length || 1} images
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                <Pencil className="h-4 w-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">All Orders</CardTitle>
                <Button variant="outline" onClick={() => exportToCSV(orders, "orders")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Items</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Payment</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-muted-foreground">
                            No orders yet
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="py-3 px-4 font-mono text-sm text-foreground">{order.id}</td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-foreground">{order.userName}</p>
                              <p className="text-xs text-muted-foreground">{order.userPhone}</p>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {order.items?.length || 0} items
                            </td>
                            <td className="py-3 px-4 font-semibold text-foreground">₹{order.total}</td>
                            <td className="py-3 px-4">
                              <div>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${order.paymentMethod === "upi" ? "bg-primary/20 text-primary" : "bg-success/20 text-success"}`}
                                >
                                  {order.paymentMethod === "upi" ? "UPI" : "COD"}
                                </span>
                                {order.utrNumber && (
                                  <p className="text-xs text-muted-foreground mt-1">UTR: {order.utrNumber}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4 text-primary" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Registered Users</CardTitle>
                <Button variant="outline" onClick={() => exportToCSV(users, "users")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Referral Code</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Coins</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No users yet
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="py-3 px-4 font-medium text-foreground">{u.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                            <td className="py-3 px-4 text-muted-foreground">{u.phone}</td>
                            <td className="py-3 px-4">
                              <code className="bg-secondary px-2 py-1 rounded text-xs">{u.referralCode}</code>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-warning font-semibold">{u.referralCoins || 0}</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Referral System Stats</CardTitle>
                <Button
                  variant="outline"
                  onClick={() =>
                    exportToCSV(
                      users.filter((u) => u.referredBy || (u.referralCoins || 0) > 0),
                      "referrals",
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{users.filter((u) => u.referredBy).length}</p>
                    <p className="text-sm text-muted-foreground">Users from Referrals</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-warning">{totalReferralCoins}</p>
                    <p className="text-sm text-muted-foreground">Total Coins Distributed</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-success">
                      {users.filter((u) => (u.referralCoins || 0) > 0).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Users with Coins</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">User</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Referral Code</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Referred By</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Coins Earned</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">People Referred</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const referrer = users.find((r) => r.id === u.referredBy)
                        const referredCount = users.filter((r) => r.referredBy === u.id).length
                        return (
                          <tr key={u.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.phone}</p>
                            </td>
                            <td className="py-3 px-4">
                              <code className="bg-secondary px-2 py-1 rounded text-xs">{u.referralCode}</code>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{referrer?.name || "-"}</td>
                            <td className="py-3 px-4">
                              <span className="text-warning font-semibold">{u.referralCoins || 0}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-primary font-semibold">{referredCount}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
