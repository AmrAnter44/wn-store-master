"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaFilterCircleXmark, FaSpinner } from "react-icons/fa6";
import { supabase } from "@/lib/supabaseClient";
import { useMyContext } from "../context/CartContext";

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

export default function StorePage() {
  const { addToCart } = useMyContext();
  
  const [hoveredId, setHoveredId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
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

  // Enhanced filtering and sorting
  const filteredProducts = products
    .filter((product) => {
      return (
        (!typeFilter || product.type === typeFilter) &&
        (!colorFilter || product.colors?.includes(colorFilter)) &&
        (!sizeFilter || product.sizes?.includes(sizeFilter)) &&
        (!minPrice || product.price >= parseFloat(minPrice)) &&
        (!maxPrice || product.price <= parseFloat(maxPrice))
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
  };

  const filterButtons = [
    { key: "dress", label: "Dresses", count: products.filter(p => p.type === "dress").length },
    { key: "casual", label: "Casual", count: products.filter(p => p.type === "casual").length },

  ];

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
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Collection</h1>
          <p className="text-gray-600">Discover the latest trends and timeless classics</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {filterButtons.map((filter) => (
              <button
                key={filter.key}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  typeFilter === filter.key
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTypeFilter(typeFilter === filter.key ? "" : filter.key)}
              >
                {filter.label}
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  typeFilter === filter.key ? "bg-white/20" : "bg-gray-200"
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
            
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
                X
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
              <div className="relative overflow-hidden bg-gray-50">
                <Link href={`/product/${product.id}`}>
                  <Image
                    src={
                      hoveredId === product.id
                        ? product.pictures?.[1] || product.pictures?.[0]
                        : product.pictures?.[0] || "/placeholder.png"
                    }
                    alt={product.name}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={index < 4}
                  />
                </Link>

                {/* Sale Badge */}
                {product.newprice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
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
    </motion.div>
  );
}