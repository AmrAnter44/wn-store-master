"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaFilterCircleXmark, FaSpinner, FaFire } from "react-icons/fa6";
import { supabase } from "@/lib/supabaseClient";
import { useMyContext } from "../context/CartContext";
import Fotter from "../app/Footer";  
// Simplified Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      duration: 0.3, 
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4
    } 
  }
};

const filterVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const categoryVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

const saleVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

export default function StorePage() {
  const { addToCart } = useMyContext();
  
  const [hoveredId, setHoveredId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: true });
          
        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Get all unique types from products and create category data
  const getAllProductTypes = () => {
    const uniqueTypes = [...new Set(products.map(p => p.type).filter(Boolean))];
    
    const categoryMapping = {
      "casual": {
        name: "Casual",
        description: "Comfortable & stylish everyday outfits",

        emoji: "",
        image: "../../casual.png"
      },
      "dress": {
        name: "Dresses", 
        description: "Elegant dresses for every occasion",

        emoji: "",
        image: "../../dress.png"
      },
      "bag": {
        name: "Bags",
        description: "Trendy bags and accessories", 

        emoji: "",
        image: "../../bag.png"
      }
    };

    // Map existing types to category data
    return uniqueTypes.map(type => {
      const mapping = categoryMapping[type] || {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        description: `Explore our ${type} collection`,
        bgColor: "from-gray-400 to-gray-600",
        emoji: "🛍️",
        image: `/${type}.png`
      };
      
      return {
        key: type,
        ...mapping
      };
    });
  };

  const categories = getAllProductTypes();

  // Get sale products (products with newprice)
  const getSaleProducts = () => {
    return products.filter(product => product.newprice && product.newprice > 0);
  };

  const saleProducts = getSaleProducts();

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };



  // Enhanced filtering and sorting
  const filteredProducts = products
    .filter((product) => {
      return (
        (!typeFilter || product.type === typeFilter) &&
        (!colorFilter || product.colors?.includes(colorFilter)) &&
        (!sizeFilter || product.sizes?.includes(sizeFilter)) &&
        (!minPrice || product.price >= parseFloat(minPrice)) &&
        (!maxPrice || product.price <= parseFloat(maxPrice)) &&
        (!searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.newprice || a.price) - (b.newprice || b.price);
        case "price-high":
          return (b.newprice || b.price) - (a.newprice || a.price);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.id - a.id; // newest first
      }
    });

  const clearAllFilters = () => {
    setTypeFilter("");
    setColorFilter("");
    setSizeFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSearchTerm("");
  };

  const handleCategoryClick = (categoryKey) => {
    setTypeFilter(categoryKey);
    // Scroll to products section
    document.getElementById('products-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-screen bg-gray-50"
      >
        <FaSpinner className="animate-spin text-4xl text-gray-400 mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Collection</h1>
          <p className="text-xl text-gray-600 mb-8">Discover the latest trends and timeless classics</p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center"
            />
          </div>
        </motion.div>

        {/* Sale Section */}
        {saleProducts.length > 0 && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            <motion.div 
              variants={saleVariants}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fuchsia-500 to-fuchsia-800 text-white px-6 py-3 rounded-full mb-4">
                <FaFire className="text-xl" />
                <span className="text-lg font-bold">SALE UP TO 50% OFF</span>
                <FaFire className="text-xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Hot Deals</h2>
              <p className="text-gray-600">Limited time offers on selected items</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.slice(0, 4).map((product, index) => (
                <motion.div
                  key={`sale-${product.id}`}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative"
                  onMouseEnter={() => setHoveredId(`sale-${product.id}`)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Hot Deal Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-fuchsia-500 to-fuchsia-8 text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
                    <FaFire className="text-xs" />
                    {getDiscountPercentage(product.price, product.newprice)}% OFF
                  </div>

                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-gray-50 h-64">
                    <Link href={`/product/${product.id}`}>
                      <Image
                        src={
                          hoveredId === `sale-${product.id}`
                            ? product.pictures?.[1] || product.pictures?.[0] || "/placeholder.png"
                            : product.pictures?.[0] || "/placeholder.png"
                        }
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </Link>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-fuchsia-500">
                        {product.newprice} LE
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {product.price} LE
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Link href={`/product/${product.id}`}>
                      <button className="w-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-800 text-white py-2 rounded-lg hover:from-fuchsia-600 hover:to-fuchsia-600 transition-all text-sm font-medium">
                        Shop Now
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {saleProducts.length > 4 && (
              <div className="text-center mt-8">
                <Link href="/sale">
                  <button className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-800 text-white px-8 py-3 rounded-full hover:from-fuchsia-600 hover:to-fuchsia-600 transition-all font-medium">
                    View All Sale Items ({saleProducts.length})
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Category Sections */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryProducts = products.filter(p => p.type === category.key);
              
              return (
                <motion.div
                  key={category.key}
                  variants={categoryVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg"
                  onClick={() => handleCategoryClick(category.key)}
                >
                  {/* Background Image */}
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.target.style.display = 'none';
                      }}
                    />
                    
                    {/* Gradient Overlays */}
                    <div className={`absolute inset-0 bg-gray-900/70 opacity-80`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10 p-6">
                      <div>
                        <div className="text-6xl mb-4 filter drop-shadow-lg">
                          {category.emoji}
                        </div>
                        <h3 className="text-2xl font-bold mb-2 filter drop-shadow-md">{category.name}</h3>
                        <p className="text-sm opacity-90 mb-4 filter drop-shadow-sm">{category.description}</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/30">
                          <span className="text-sm font-medium">
                            {categoryProducts.length} Products
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Active Filter Indicator */}
                    {typeFilter === category.key && (
                      <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        Active
                      </div>
                    )}

                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl transition-all duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Products Section */}
        <div id="products-section">
          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
          >
            {/* Active Category Display */}
            {typeFilter && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Filtering by:</span>
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                      {categories.find(c => c.key === typeFilter)?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setTypeFilter("")}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Clear Category
                  </button>
                </div>
              </div>
            )}

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              
              {/* Action Buttons */}
              <div className="ml-auto flex gap-3">
                <button
                  className="px-6 py-3 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
                
                <button
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 
                    <FaFilterCircleXmark className="w-5 h-5" /> : 
                    <FaFilter className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  variants={filterVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                    <select
                      value={colorFilter}
                      onChange={(e) => setColorFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">All Colors</option>
                      <option value="black">Black</option>
                      <option value="white">White</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                    </select>

                    <select
                      value={sizeFilter}
                      onChange={(e) => setSizeFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">All Sizes</option>
                      <option value="S">Small</option>
                      <option value="M">Medium</option>
                      <option value="L">Large</option>
                      <option value="XL">Extra Large</option>
                    </select>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Price:</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-24 px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="text-gray-500">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-24 px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Counter */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
              {typeFilter && (
                <span className="ml-2 text-sm">
                  in <span className="font-semibold">{categories.find(c => c.key === typeFilter)?.name}</span>
                </span>
              )}
              {searchTerm && (
                <span className="ml-2 text-sm">
                  for "<span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>

          {/* Product Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-50 h-64">
                  <Link href={`/product/${product.id}`}>
                    <Image
                      src={
                        hoveredId === product.id
                          ? product.pictures?.[1] || product.pictures?.[0] || "/placeholder.png"
                          : product.pictures?.[0] || "/placeholder.png"
                      }
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      priority={index < 8}
                    />
                  </Link>

                  {/* Sale Badge */}
                  {product.newprice && (
                    <div className="absolute top-3 left-3 bg-fuchsia-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      SALE
                    </div>
                  )}

                  {/* Color Dots */}
                  {product.colors?.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex gap-1">
                      {product.colors.slice(0, 4).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {product.colors.length > 4 && (
                        <div className="w-4 h-4 rounded-full bg-gray-600 border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    {product.newprice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {product.newprice} LE
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price} LE
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">
                        {product.price} LE
                      </span>
                    )}
                  </div>

                  {/* Available Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex gap-1 mb-4">
                      <span className="text-xs text-gray-500 mr-2">Sizes:</span>
                      {product.sizes.slice(0, 4).map((size, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link href={`/product/${product.id}`}>
                    <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}