"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"

import Image from "next/image";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // جلب المنتجات
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
    if (error) console.error(error);
    else setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // حذف منتج
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const result = await res.json();

    if (res.ok) {
      setMessage("Product deleted successfully!");
      fetchProducts();
    } else {
      setMessage(result.error || "Error deleting product");
    }
  };

  // تعديل منتج (هيفتح نافذة تعديل بسيطة)
  const handleEdit = async (prod) => {
    const newName = prompt("Enter new product name", prod.name);
    if (!newName) return;

    const newPrice = prompt("Enter new price", prod.price);
    if (!newPrice) return;

    const { data, error } = await supabase.from("products").update({ name: newName, price: Number(newPrice) }).eq("id", prod.id);
    if (error) {
      alert("Error updating product: " + error.message);
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Manage Products</h1>

      {message && <p className="text-center text-green-600 mb-4">{message}</p>}
      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="border rounded-xl p-4 relative flex flex-col items-center shadow hover:shadow-lg transition">
<Image
  src={prod.pictures?.[0] || "/placeholder.png"} 
  alt={prod.name}
  width={400}
  height={300}
  className="rounded object-cover"
/>

              <h2 className="font-semibold text-lg text-center">{prod.name}</h2>
              <p className="text-gray-600 font-thin">{prod.price} LE</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(prod)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
