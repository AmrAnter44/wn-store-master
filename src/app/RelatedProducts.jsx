"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from '@/lib/supabaseClient'


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
    <div className="mt-6 mx-auto">
      <h3 className="text-xl font-semibold mb-4">Related Products</h3>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {related.map((product) => (
                   <Link href={`/product/${product.id}`} key={product.id}>
                <div
                  className="relative p-2 m-2  rounded-2xl flex flex-col justify-center items-center object-cover transition-opacity duration-700 ease-in-out opacity-100 hover:opacity-80"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Product Image */}
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

                  {/* Color Options Preview (dots) */}
                  <div className="absolute bottom-50 lg:bottom-35 right-3 lg:right-4 flex flex-col">
                    {product.colors?.length > 1 &&
                      product.colors.slice(0, 3).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-2 h-2 hover:scale-125 transition-transform duration-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col text-start w-full p-2">
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
                  </div>
                </div>
              </Link>
        ))}
      </div>
    </div>
  )
}
