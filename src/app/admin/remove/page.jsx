"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const backdropVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants = {
  idle: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95
  }
};

const messageVariants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
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
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(result.error || "Error deleting product");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price);
    setEditNewPrice(prod.newprice || "");
    setEditColors(prod.colors || []);
  };

  const toggleColor = (color) => {
    setEditColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

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
      setMessage("Product updated successfully!");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <motion.div 
      className="p-6 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Manage Products
      </motion.h1>

      <AnimatePresence>
        {message && (
          <motion.p 
            className={`text-center mb-4 ${
              message.includes("successfully") ? "text-green-600" : "text-red-600"
            }`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {loading ? (
        <motion.div 
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full mb-4"
            variants={loadingVariants}
            animate="animate"
          />
          <p className="text-center">Loading products...</p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {products.map((prod, index) => (
            <motion.div
              key={prod.id}
              className="border rounded-xl p-4 relative flex flex-col items-center shadow hover:shadow-lg transition"
              variants={cardVariants}
              whileHover="hover"
              custom={index}
              layout
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Image
                  src={prod.pictures?.[0] || "/placeholder.png"}
                  alt={prod.name}
                  width={400}
                  height={300}
                  className="rounded object-cover"
                />
              </motion.div>

              <motion.h2 
                className="font-semibold text-lg text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
              >
                {prod.name}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                <p className="text-gray-600 font-thin">{prod.price} LE</p>
                {prod.newprice && <p className="text-gray-500 font-thin">New: {prod.newprice} LE</p>}
              </motion.div>

              <motion.div 
                className="flex gap-2 mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
              >
                <motion.button
                  onClick={() => openEditModal(prod)}
                  className="px-3 py-1 bg text-white rounded transition"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(prod.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Delete
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal للتعديل */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              className="bg-white p-6 rounded shadow-lg w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.h2 
                className="text-xl font-bold mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Edit Product
              </motion.h2>

              <motion.input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="w-full mb-2 p-2 border rounded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileFocus={{ scale: 1.01, borderColor: "#8b5cf6" }}
              />

              <motion.input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Price"
                className="w-full mb-2 p-2 border rounded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileFocus={{ scale: 1.01, borderColor: "#8b5cf6" }}
              />

              <motion.input
                type="number"
                value={editNewPrice}
                onChange={(e) => setEditNewPrice(e.target.value)}
                placeholder="New Price"
                className="w-full mb-2 p-2 border rounded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileFocus={{ scale: 1.01, borderColor: "#8b5cf6" }}
              />

              <motion.div 
                className="flex flex-wrap gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {colorOptions.map((color, idx) => (
                  <motion.button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`px-2 py-1 rounded border ${
                      editColors.includes(color) ? "bg text-white" : "bg-white"
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                  </motion.button>
                ))}
              </motion.div>

              <motion.div 
                className="flex justify-end gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <motion.button
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Save
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}