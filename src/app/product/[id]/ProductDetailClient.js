"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import RelatedProducts from "../../RelatedProducts"
import { useMyContext } from "../../../context/CartContext"
import toast, { Toaster } from 'react-hot-toast'

export default function ProductDetailClient({ productId }) {
  const { addToCart } = useMyContext()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedImage, setSelectedImage] = useState("")
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) {
        console.error("Error fetching product:", error)
        toast.error("Failed to load product")
        return
      }

      setProduct(data)
      setSelectedColor(data.colors?.[0] || "")
      setSelectedSize(data.sizes?.[0] || "")
      setSelectedImage(data.pictures?.[0] || "")
      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("⚠️ Please select a size first!", {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: 'white',
        }
      })
      return
    }

    try {
      addToCart({ ...product, selectedColor, selectedSize })
      setAdded(true)
      
      toast.success(`🛒 ${product.name} added to cart!`, {
        duration: 2000,
        style: {
          background: '#10B981',
          color: 'white',
        }
      })

      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.")
    }
  }

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-3 text-gray-600">Loading product...</span>
      </motion.div>
    )
  }

  if (!product) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-10 text-center"
      >
        <div className="text-4xl mb-4">😢</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </motion.div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontWeight: '500',
          },
        }}
      />
      
      <motion.div 
        className="max-w-6xl mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="p-6 flex flex-col lg:flex-row gap-8  rounded-2xl "
          variants={itemVariants}
        >
          {/* صور المنتج */}
          <motion.div 
            className="flex flex-col-reverse lg:w-1/2"
            variants={itemVariants}
          >
            {/* Thumbnails */}
            <motion.div 
              className="flex gap-3 mt-4 overflow-x-auto pb-2"
              variants={itemVariants}
            >
              {product.pictures?.map((img, idx) => (
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
                    alt={`${product.name} ${idx + 1}`} 
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
                  alt={product.name} 
                  width={500} 
                  height={600}
                  className="w-full object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* تفاصيل المنتج */}
          <motion.div 
            className="flex flex-col gap-6 lg:w-1/2"
            variants={itemVariants}
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </motion.div>

            {/* السعر */}
            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
            >
              {product.newprice ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    {product.newprice} LE
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {product.price} LE
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {Math.round((1 - product.newprice / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {product.price} LE
                </span>
              )}
            </motion.div>

            {/* ألوان */}
            {product.colors && product.colors.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Color: {selectedColor}
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color, idx) => {
                    const isSelected = selectedColor === color
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(color)
                          setSelectedImage(
                            product.pictures?.[idx] || product.pictures?.[0]
                          )
                        }}
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

            {/* مقاسات */}
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Size: {selectedSize || "Please select"}
              </h3>
              <div className="flex gap-3">
                {["S", "M", "L", "XL"].map((size) => {
                  const isAvailable = product.sizes?.includes(size)
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

            {/* زرار إضافة للعربة */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.button
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  added
                    ? "bg text-white"
                    : "bg text-white hover:bg-gray-800"
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

        {/* Related Products */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.3 }}
        >
          <RelatedProducts currentProduct={product} />
        </motion.div>
      </motion.div>
    </>
  )
}