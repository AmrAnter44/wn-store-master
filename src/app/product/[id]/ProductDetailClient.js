"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import RelatedProducts from "../../RelatedProducts"
import { useMyContext } from "../../../context/CartContext"

export default function ProductDetailClient({ productId }) {
  const { addToCart } = useMyContext()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedImage, setSelectedImage] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) return console.error("Error fetching product:", error)

      setProduct(data)
      setSelectedColor(data.colors?.[0] || "")
      setSelectedSize(data.sizes?.[0] || "")
      setSelectedImage(data.pictures?.[0] || "")
      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!product) return <div className="p-10 text-center">Product not found</div>

  const handleAddToCart = () => {
    if (!selectedSize) {
      setMessage({ type: "error", text: "⚠ Please select a size" })
      return
    }

    addToCart({ ...product, selectedColor, selectedSize })
    setMessage({ type: "success", text: "🛒 Product added!" })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
    <div className="p-6 flex flex-col lg:flex-row gap-6 bg-white">
      {/* صور المنتج */}
      <div className="flex flex-col-reverse ">
        <div className="flex gap-2 ">
          {product.pictures?.map((img, idx) => (
            <div key={idx} onClick={() => setSelectedImage(img)} className="cursor-pointer mt-2">
              <Image src={img} alt={`thumb-${idx}`} width={60} height={90} />
            </div>
          ))}
        </div>
        <div className="">
          <Image src={selectedImage} alt="Main" width={400} height={500} />
        </div>
      </div>

      {/* تفاصيل المنتج */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-700">{product.description}</p>
        <p className="text-xl font-semibold">{product.price} LE</p>

        {/* ألوان */}
        <div className="flex gap-2 my-2">
          {product.colors?.map((color, idx) => {
            const isSelected = selectedColor === color
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedColor(color)
                  setSelectedImage(product.pictures?.[idx] || product.pictures?.[0])
                }}
                className={`w-8 h-8 rounded-full border-2 ${isSelected ? "border-black" : "border-gray-300"}`}
                style={{ backgroundColor: color }}
              />
            )
          })}
        </div>

        {/* مقاسات */}
        <div className="flex gap-2 my-2">
          {["S", "M", "L", "XL"].map((size) => {
            const isAvailable = product.sizes?.includes(size)
            const isSelected = selectedSize === size
            return (
              <button
                key={size}
                onClick={() => isAvailable && setSelectedSize(size)}
                disabled={!isAvailable}
                className={`w-10 h-10 rounded-full border-2 ${isSelected ? "border-black" : "border-gray-300"} ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {size}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleAddToCart}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Add to Cart
        </button>

        {message.text && (
          <p className={`mt-2 ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Related Products */}
      
    </div>
    <RelatedProducts currentProduct={product} />
    </div>
  )
}
