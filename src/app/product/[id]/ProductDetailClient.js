"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useMyContext } from "../../../context/CartContext"
import toast, { Toaster } from 'react-hot-toast'

/**
 * Product Detail Client Component محسن للـ SSG
 * يستقبل البيانات من الserver component ويعرضها بدون API calls إضافية
 */
export default function ProductDetailClientSSG({ 
  productId, 
  initialProduct, 
  initialRelatedProducts = [] 
}) {
  const { addToCart } = useMyContext()
  const [selectedColor, setSelectedColor] = useState(initialProduct?.colors?.[0] || "")
  const [selectedSize, setSelectedSize] = useState(
    initialProduct?.type?.toLowerCase() === "bag" ? "" : (initialProduct?.sizes?.[0] || "")
  )
  const [selectedImage, setSelectedImage] = useState(initialProduct?.pictures?.[0] || "")
  const [added, setAdded] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  console.log(`📦 ProductDetailClient rendered for: ${initialProduct?.name}`)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  const handleAddToCart = () => {
    const isBag = initialProduct.type?.toLowerCase() === "bag"
    
    if (!isBag && !selectedSize) {
      toast.error("⚠️ Please select a size first!", {
        duration: 3000,
        style: { background: '#EF4444', color: 'white' }
      })
      return
    }

    try {
      addToCart({ ...initialProduct, selectedColor, selectedSize })
      setAdded(true)
      
      toast.success(`🛒 ${initialProduct.name} added to cart!`, {
        duration: 2000,
        style: { background: '#10B981', color: 'white' }
      })

      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.")
    }
  }

  // Product Image Component with hover effect
  const ProductImage = ({ product, hoveredId, className, priority = false }) => {
    const [imageSrc, setImageSrc] = useState(selectedImage)

    const handleError = () => {
      setImageSrc('https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png')
    }

    return (
      <Image
        src={imageSrc}
        alt={product.name}
        fill
        className={className}
        onError={handleError}
        sizes="(max-width: 640px) 100vw, 50vw"
        priority={priority}
      />
    )
  }

  if (!initialProduct) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-10 text-center"
      >
        <div className="text-4xl mb-4">😢</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        <Link href="/store">
          <button className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Back to Store
          </button>
        </Link>
      </motion.div>
    )
  }

  const isBag = initialProduct.type?.toLowerCase() === "bag"

  return (
    <>
      <Toaster position="top-right" />
      
      <motion.div 
        className="max-w-6xl mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="p-6 flex flex-col lg:flex-row gap-8 rounded-2xl"
          variants={itemVariants}
        >
          {/* صور المنتج */}
          <motion.div className="flex flex-col-reverse lg:w-1/2" variants={itemVariants}>
            {/* Thumbnails */}
            <motion.div className="flex gap-3 mt-4 overflow-x-auto pb-2" variants={itemVariants}>
              {initialProduct.pictures?.map((img, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`cursor-pointer flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image 
                    src={img} 
                    alt={`${initialProduct.name} ${idx + 1}`} 
                    width={60} 
                    height={80}
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedImage}
                className="rounded-xl overflow-hidden bg-gray-50"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <Image 
                  src={selectedImage} 
                  alt={initialProduct.name} 
                  width={500} 
                  height={600}
                  className="w-full object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* تفاصيل المنتج */}
          <motion.div className="flex flex-col gap-6 lg:w-1/2" variants={itemVariants}>
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{initialProduct.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{initialProduct.description}</p>
            </motion.div>

            {/* السعر */}
            <motion.div className="flex items-center gap-4" variants={itemVariants}>
              {initialProduct.newprice ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    {initialProduct.newprice} LE
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {initialProduct.price} LE
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {Math.round((1 - initialProduct.newprice / initialProduct.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {initialProduct.price} LE
                </span>
              )}
            </motion.div>

            {/* ألوان */}
            {initialProduct.colors && initialProduct.colors.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Color: {selectedColor}
                </h3>
                <div className="flex gap-3">
                  {initialProduct.colors.map((color, idx) => {
                    const isSelected = selectedColor === color
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          isSelected ? "border-black scale-110" : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isSelected && (
                          <motion.div
                            className="w-full h-full rounded-full border-2 border-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* مقاسات - Hidden for bags */}
            {!isBag && (
              <motion.div variants={itemVariants}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Size: {selectedSize || "Please select"}
                </h3>
                <div className="flex gap-3">
                  {["S", "M", "L", "XL"].map((size) => {
                    const isAvailable = initialProduct.sizes?.includes(size)
                    const isSelected = selectedSize === size
                    return (
                      <motion.button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                          isSelected 
                            ? "border-black bg-black text-white" 
                            : isAvailable 
                              ? "border-gray-300 bg-white text-gray-900 hover:border-gray-400" 
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                      >
                        {size}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* زرار إضافة للعربة */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.button
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={added}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.div
                      key="added"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span>✓</span>
                      <span>Added to Cart!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span>Add to Cart</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* معلومات إضافية */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bgg">🚚</span>
                  <span>Free shipping over 2000 LE</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bgg">🔄</span>
                  <span>30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bgg">⭐</span>
                  <span>Authentic guarantee</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Related Products Section - Using initial data */}
        {initialRelatedProducts.length > 0 && (
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.3 }}
            className="mt-12 mx-auto"
          >
            {/* Header */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 mb-8"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                You Might Also Like
              </h3>
              <p className="text-gray-600 text-sm">
                Similar products based on your current selection
              </p>
            </motion.div>
            
            {/* Grid */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
            >
              {initialRelatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* صورة المنتج */}
                  <div className="relative overflow-hidden bg-gray-50">
                    <Image
                      src={
                        hoveredId === product.id
                          ? product.pictures?.[1] || product.pictures?.[0]
                          : product.pictures?.[0] || "/placeholder.png"
                      }
                      alt={product.name}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      width={300}
                      height={400}
                    />

                    {/* Badge للمنتجات المخفضة */}
                    {product.newprice && (
                      <motion.div
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: -12 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                      >
                        Sale
                      </motion.div>
                    )}

                    {/* نقاط الألوان */}
                    {product.colors?.length > 1 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="absolute bottom-3 right-3 flex gap-1"
                      >
                        {product.colors.slice(0, 3).map((color, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              duration: 0.2, 
                              delay: 0.3 + (idx * 0.1),
                              ease: "easeOut"
                            }}
                            whileHover={{ scale: 1.3 }}
                            className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.6 }}
                            className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-sm flex items-center justify-center"
                          >
                            <span className="text-white text-xs font-bold">+</span>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* معلومات المنتج */}
                  <div className="p-5">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.name.length > 40
                        ? product.name.slice(0, 40) + "..."
                        : product.name}
                    </h3>
                    
                    {/* السعر */}
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

                    {/* المقاسات المتاحة */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex gap-1 mb-4">
                        {product.sizes.slice(0, 4).map((size, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {size}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    {/* زرار المشاهدة */}
                    <Link href={`/product/${product.id}`}>
                      <motion.button 
                        className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Details
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* زرار عرض المزيد */}
            {initialRelatedProducts.length >= 8 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="text-center mt-8"
              >
                <Link href="/store">
                  <motion.button
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-black hover:text-black transition-colors font-medium"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View More Products
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  )
}