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
  const [added, setAdded] = useState(false) // ✅ بدل message

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
      alert("⚠ Please select a size") // نسيبها Alert بس للخطأ
      return
    }

    addToCart({ ...product, selectedColor, selectedSize })
    setAdded(true)

    // يرجع الزرار بعد 2 ثانية
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="p-6 flex flex-col lg:flex-row gap-6 bg-white">
        {/* صور المنتج */}
        <div className="flex flex-col-reverse ">
          <div className="flex gap-2 ">
            {product.pictures?.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className="cursor-pointer mt-2"
              >
                <Image src={img} alt={`thumb-${idx}`} width={40} height={60} />
              </div>
            ))}
          </div>
          <div className="">
            <Image src={selectedImage} alt="Main" width={300} height={400} />
          </div>
        </div>

        {/* تفاصيل المنتج */}
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-bold">{product.name}</h1>

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
              <p className="text-gray-600 font-thin">{product.price} .LE</p>
            )}
          </div>

          {/* ألوان */}
          <div className="flex gap-2 my-2">
            {product.colors?.map((color, idx) => {
              const isSelected = selectedColor === color
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedImage(
                      product.pictures?.[idx] || product.pictures?.[0]
                    )
                  }}
                  className={`w-6 h-5 rounded-full border-2 ${
                    isSelected ? "border-black" : "border-gray-300"
                  }`}
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
                  className={`text-[10px] w-6 h-6 rounded-full border-2 ${
                    isSelected ? "border-black" : "border-gray-300"
                  } ${
                    !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>

          {/* زرار إضافة للعربة */}
          <button
            onClick={handleAddToCart}
            className={`px-4 py-2 rounded transition ${
              added
                ? "bg-green-600 text-white"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {added ? "Product Added!" : "Add to Cart"}
          </button>
        </div>
      </div>


    </div>
  )
}
