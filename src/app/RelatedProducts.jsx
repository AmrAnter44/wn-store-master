"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from '@/lib/supabaseClient'
import { motion } from "framer-motion"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function RelatedProducts({ currentProduct }) {
  const [related, setRelated] = useState([])
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!currentProduct) return
    const fetchRelated = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("type", currentProduct.type)
        .neq("id", currentProduct.id)

      if (error) return console.error(error)

      const sorted = data
        .map((p) => ({ ...p, priceDiff: Math.abs(p.price - currentProduct.price) }))
        .sort((a, b) => a.priceDiff - b.priceDiff)
        .slice(0, 10)

      setRelated(sorted)
    }

    fetchRelated()
  }, [currentProduct])

  if (related.length === 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-6 mx-auto"
    >
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl font-semibold mb-4"
      >
        Related Products
      </motion.h3>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
      >
        {related.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={`/product/${product.id}`}>
              <div
                className="relative p-2 m-2 rounded-2xl flex flex-col justify-center items-center object-cover transition-opacity duration-700 ease-in-out opacity-100"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Product Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={
                      hoveredId === product.id
                        ? product.pictures?.[1] || product.pictures?.[0]
                        : product.pictures?.[0] || "/placeholder.png"
                    }
                    alt={product.name}
                    className="relative rounded mx-auto object-cover"
                    width={300}
                    height={400}
                  />
                </motion.div>

                {/* Color Options Preview (dots) */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute bottom-50 lg:bottom-35 right-3 lg:right-4 flex flex-col"
                >
                  {product.colors?.length > 1 &&
                    product.colors.slice(0, 3).map((color, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: 0.3 + (idx * 0.1),
                          ease: "easeOut"
                        }}
                        whileHover={{ scale: 1.25 }}
                        className="w-2 h-2 transition-transform duration-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                </motion.div>

                {/* Product Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex flex-col text-start w-full p-2"
                >
                  {/* Name */}
                  <div className="flex flex-row justify-between">
                    <h2 className="text-lg font-semibold">
                      {product.name.length > 30
                        ? product.name.slice(0, 30) + "..."
                        : product.name}
                    </h2>
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center mt-1">
                    {product.newprice ? (
                      <>
                        <p>
                          <span className="text-gray-600 font-thin line-through mr-auto">
                            {product.price} .LE
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600 font-thin">
                            {product.newprice} .LE
                          </span>
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-600 font-thin">
                        {product.price} .LE
                      </p>
                    )}
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Link      
                      href={`/product/${product.id}`}             
                      className="bg text-center text-white px-2 text-sm py-1 rounded mt-2 hover:bg-gray-800 transition-colors duration-200"
                    >
                      Add to Cart
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}