import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Filter, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

// Mock products data
const products = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 29.99,
    image: "https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    category: "T-Shirts",
    colors: ["White", "Black", "Navy"]
  },
  {
    id: 2,
    name: "Cozy Pullover Hoodie",
    price: 59.99,
    image: "https://images.pexels.com/photos/3253490/pexels-photo-3253490.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    category: "Hoodies",
    colors: ["Gray", "Black", "Maroon"]
  },
  {
    id: 3,
    name: "Classic Denim Jacket",
    price: 89.99,
    image: "https://images.pexels.com/photos/6276009/pexels-photo-6276009.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    category: "Jackets",
    colors: ["Blue", "Black"]
  },
  {
    id: 4,
    name: "Vintage Logo Sweatshirt",
    price: 49.99,
    image: "https://images.pexels.com/photos/10481315/pexels-photo-10481315.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    category: "Sweatshirts",
    colors: ["White", "Gray", "Navy"]
  },
  {
    id: 5,
    name: "Essential Polo Shirt",
    price: 39.99,
    image: "https://images.pexels.com/photos/4887245/pexels-photo-4887245.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    category: "T-Shirts",
    colors: ["White", "Black", "Blue"]
  },
  {
    id: 6,
    name: "Comfort Fit Jeans",
    price: 79.99,
    image: "https://images.pexels.com/photos/10206444/pexels-photo-10206444.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    category: "Pants",
    colors: ["Blue", "Black", "Gray"]
  }
]

const categories = ["All", "T-Shirts", "Hoodies", "Jackets", "Sweatshirts", "Pants"]

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { addItem } = useCart()

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(product => product.category === selectedCategory)

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-poppins font-bold text-3xl lg:text-4xl text-foreground mb-4">
            Our Products
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover our complete collection of premium clothing designed for comfort, style, and sustainability.
          </p>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter & Sort
          </Button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-poppins font-semibold text-xl text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-6">
              No products available in the {selectedCategory} category.
            </p>
            <Button onClick={() => setSelectedCategory("All")} variant="outline">
              View All Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-soft-lg transition-all duration-300 border-0 bg-card">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-poppins font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="text-sm text-muted-foreground">{product.rating}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">•</span>
                        <span className="text-sm text-muted-foreground">
                          {product.colors.length} colors
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-poppins font-bold text-xl text-foreground">
                        ${product.price}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              size: 'M', // Default size for quick add
                              color: product.colors[0] // Default color
                            })
                          }}
                          className="group-hover:shadow-md transition-shadow"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Link to={`/product/${product.id}`}>
                          <Button className="group-hover:shadow-md transition-shadow">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
