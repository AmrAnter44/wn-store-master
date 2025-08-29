"use client";
import { useState } from "react";
import products from "../data/product";
import Link from "next/link";
import { useMyContext } from "../context/CartContext";
import Image from "next/image";
import { FaFilter, FaFilterCircleXmark } from "react-icons/fa6";

export default function StorePage() {
  const { addToCart } = useMyContext();
  const [hoveredId, setHoveredId] = useState(null);

  // 🧾 الفلاتر
  const [typeFilter, setTypeFilter] = useState(""); // dress | casual
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false); // تحكم إظهار/إخفاء الفلاتر

  // 🔍 تطبيق الفلاتر على المنتجات
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
      {/* 🛠️ أزرار الفلترة الأساسية */}
      <div className="flex flex-wrap gap-2 p-4 bg-white shadow rounded mb-4">
        
        {/* Dress */}
        <button
          className={`px-8 py-2 rounded ${
            typeFilter === "dress" ? "bg text-white" : "bg-gray-200"
          }`}
          onClick={() => setTypeFilter(typeFilter === "dress" ? "" : "dress")}
        >
          Dress
        </button>

        {/* Casual */}
        <button
          className={`px-8 py-2 rounded ${
            typeFilter === "casual" ? "bg text-white" : "bg-gray-200"
          }`}
          onClick={() => setTypeFilter(typeFilter === "casual" ? "" : "casual")}
        >
          Casual
        </button>

        {/* All Products */}
        <button
          onClick={() => {
            setTypeFilter("");
            setColorFilter("");
            setSizeFilter("");
            setMinPrice("");
            setMaxPrice("");
          }}
          className={`px-4 py-2 rounded ${
            !typeFilter && !colorFilter && !sizeFilter && !minPrice && !maxPrice
              ? "bg text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          All
        </button>

        {/* زرار إظهار/إخفاء الفلاتر الإضافية */}
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded ml-auto"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? <FaFilterCircleXmark /> : <FaFilter />}
        </button>
      </div>

      {/* 🧰 الفلاتر الإضافية */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-100 rounded mb-4">
          {/* اللون */}
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
          </select>

          {/* المقاس */}
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

          {/* السعر (من - إلى) */}
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

      {/* 🛍️ عرض المنتجات */}
      <div className="p-2 grid gap-12 grid-cols-1 sm:grid-cols-3 md:grid-cols-4">
        {filteredProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <div
              className="p-2 m-2 h-120 rounded-2xl flex flex-col justify-center items-center object-cover transition-opacity duration-700 ease-in-out opacity-100 hover:opacity-80"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* الصورة (بتتغير عند الهوفر) */}
              <Image
                src={
                  hoveredId === product.id
                    ? product.picture[1] || product.picture[0]
                    : product.picture[0] || product.picture
                }
                alt={product.name}
                className="rounded relative mx-auto object-cover"
                width={300}
                height={800}
              />

              {/* التفاصيل */}
              <div className="flex flex-col text-start">
                <div className="flex flex-row justify-between">
                  {/* العنوان (محدود بعدد كلمات) */}
                  <h2 className="text-sm font-semibold p-2 w-70">
                    {product.name.split(" ").length > 6
                      ? product.name.split(" ").slice(0, 6).join(" ") + "..."
                      : product.name}
                  </h2>

                  {/* ألوان المنتج (بحد أقصى 3 ألوان) */}
                  <div className="flex flex-col">
                    {product.colors?.length > 1
                      ? product.colors.slice(0, 3).map((color) => (
                          <div
                            key={color}
                            className="w-4 h-4 border rounded-full m-1"
                            style={{ backgroundColor: color }}
                          />
                        ))
                      : null}
                  </div>
                </div>

                {/* السعر */}
                <div className="flex flex-row justify-between">
                  {product.newPrice ? (
                    <>
                      <p className="font-thin text-xl">{product.newPrice}.LE</p>
                      <p className="text-gray-400 font-thin text-xl line-through">
                        {product.price}.LE
                      </p>
                    </>
                  ) : (
                    <p className="font-thin text-xl">{product.price}.LE</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
