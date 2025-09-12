"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingProduct, setEditingProduct] = useState(null); // المنتج اللي بيتم تعديله
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNewPrice, setEditNewPrice] = useState("");
  const [editColors, setEditColors] = useState([]);

  const colorOptions = [
    "white","black","red","blue","green","yellow","orange","purple",
    "pink","brown","gray","beige","cyan","magenta","lime","indigo",
    "violet","turquoise","gold","silver","navy","maroon","olive","teal"
  ];

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error(error);
    else setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  // تفتح Modal للتعديل
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price);
    setEditNewPrice(prod.newprice || "");
    setEditColors(prod.colors || []);
  };

  // Toggle color في edit modal
  const toggleColor = (color) => {
    setEditColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // حفظ التعديل
  const handleSaveEdit = async () => {
    if (!editName || !editPrice) return alert("Name and price required!");

    const { data, error } = await supabase
      .from("products")
      .update({
        name: editName,
        price: Number(editPrice),
        newprice: editNewPrice ? Number(editNewPrice) : null,
        colors: editColors
      })
      .eq("id", editingProduct.id);

    if (error) {
      alert("Error updating product: " + error.message);
    } else {
      setEditingProduct(null);
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
            <div
              key={prod.id}
              className="border rounded-xl p-4 relative flex flex-col items-center shadow hover:shadow-lg transition"
            >
              <Image
                src={prod.pictures?.[0] || "/placeholder.png"}
                alt={prod.name}
                width={400}
                height={300}
                className="rounded object-cover"
              />
              <h2 className="font-semibold text-lg text-center">{prod.name}</h2>
              <p className="text-gray-600 font-thin">{prod.price} LE</p>
              {prod.newprice && <p className="text-gray-500 font-thin">New: {prod.newprice} LE</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEditModal(prod)}
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

      {/* Modal للتعديل */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="Price"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              value={editNewPrice}
              onChange={(e) => setEditNewPrice(e.target.value)}
              placeholder="New Price"
              className="w-full mb-2 p-2 border rounded"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`px-2 py-1 rounded border ${
                    editColors.includes(color) ? "bg-purple-500 text-white" : "bg-white"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
