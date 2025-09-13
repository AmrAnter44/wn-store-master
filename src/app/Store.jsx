"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

import { FaFilter, FaFilterCircleXmark } from "react-icons/fa6";
import { useMyContext } from "../context/CartContext";


export default function StorePage() {
  const { addToCart } = useMyContext();

  // 🟣 State
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null); // ✅ Popup state

  // 🔍 Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // 📦 Products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // 🎯 Filter products
  const filteredProducts = products.filter((product) => {
    return (
      (!typeFilter || product.type === typeFilter) &&
      (!colorFilter || product.colors?.includes(colorFilter)) &&
      (!sizeFilter || product.sizes?.includes(sizeFilter)) &&
      (!minPrice || product.price >= parseFloat(minPrice)) &&
      (!maxPrice || product.price <= parseFloat(maxPrice))
    );
  });

  return (
    <>
      {loading ? (
        <p className="text-center mt-10">Loading products...</p>
      ) : (
        <>
          {/* 🔘 Quick Type Filters */}
          <div className="flex flex-wrap gap-2 p-4 bg-white shadow rounded mb-4">
            {/* Dress Filter */}
            <button
              className={`px-8 py-2 rounded ${
                typeFilter === "dress"
                  ? "bg text-white"
                  : "bg-gray-200"
              }`}
              onClick={() =>
                setTypeFilter(typeFilter === "dress" ? "" : "dress")
              }
            >
              Dress
            </button>

            {/* Casual Filter */}
            <button
              className={`px-8 py-2 rounded ${
                typeFilter === "casual"
                  ? "bg text-white"
                  : "bg-gray-200"
              }`}
              onClick={() =>
                setTypeFilter(typeFilter === "casual" ? "" : "casual")
              }
            >
              Casual
            </button>

            {/* Reset All Filters */}
            <button
              onClick={() => {
                setTypeFilter("");
                setColorFilter("");
                setSizeFilter("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className={`px-4 py-2 rounded ${
                !typeFilter &&
                !colorFilter &&
                !sizeFilter &&
                !minPrice &&
                !maxPrice
                  ? "bg text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All
            </button>

            {/* Toggle Advanced Filters */}
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded ml-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <FaFilterCircleXmark /> : <FaFilter />}
            </button>
          </div>

          {/* 🎛 Advanced Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 p-4 bg-gray-100 rounded mb-4">
              {/* Color Filter */}
              <select
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Color</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="b09dc1da">Custom Purple</option>
              </select>

              {/* Size Filter */}
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Size</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="border p-2 rounded w-24"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="border p-2 rounded w-24"
                />
              </div>
            </div>
          )}

          {/* 🛍 Products Grid */}
          <div className="p-2 grid gap-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="relative p-2 m-2 rounded-2xl flex flex-col justify-center items-center transition-opacity duration-700 ease-in-out opacity-100 hover:opacity-80"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Product Image + Info داخل لينك */}
                <Link href={`/product/${product.id}`} className="w-full">
                  <Image
                    src={
                      hoveredId === product.id
                        ? product.pictures?.[1] || product.pictures?.[0]
                        : product.pictures?.[0] || "/placeholder.png"
                    }
                    alt={product.name}
                    className="rounded mx-auto object-cover"
                    width={300}
                    height={400}
                  />

                  <div className="flex flex-col text-start w-full p-2">
                    <h2 className="text-lg font-semibold">
                      {product.name.length > 30
                        ? product.name.slice(0, 30) + "..."
                        : product.name}
                    </h2>

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
                </Link>

                {/* ✅ Add to Cart button */}

                <Link      href={`/product/${product.id}`}             className="bg text-white px-4 py-2 rounded mt-2 hover:bg-gray-800 transition">
                                  Add to Cart
                </Link>
              </div>
            ))}
          </div>

          {/* ✅ Popup for ProductDetailClient */}
          {selectedProductId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full relative">
                {/* Close button */}
                <button
                  className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl "
                  onClick={() => setSelectedProductId(null)}
                >
                  &times;
                </button>

                <Storepopup productId={selectedProductId} />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
 