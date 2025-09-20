"use client";

import { useState, useEffect, useMemo } from "react";
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

const searchVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
    transition: {
      duration: 0.2
    }
  }
};

const confirmationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.7,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNewPrice, setEditNewPrice] = useState("");
  const [editColors, setEditColors] = useState([]);
  const [editPictures, setEditPictures] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const colorOptions = [
    "white","black","red","fuchsia","green","yellow","orange","purple",
    "pink","brown","gray","beige","cyan","magenta","lime","indigo",
    "violet","turquoise","gold","silver","navy","maroon","olive","teal"
  ];

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [products, searchTerm]);

  const checkStorageSetup = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Storage check error:', error);
        setMessage('Call 01028518754');
        return;
      }

      const bucketExists = data.some(bucket => bucket.name === 'product-images');
      
    } catch (error) {
      console.error('Storage setup check failed:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });
        
      if (error) {
        console.error(error);
        setMessage("Error loading products: " + error.message);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Error loading products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStorageSetup();
    fetchProducts();
  }, []);

  const showDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: "DELETE" });
      
      if (!res.ok) {
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await res.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // Keep the HTTP status message
          }
        }
        
        setMessage(errorMessage);
        setTimeout(() => setMessage(""), 5000);
        return;
      }

      setMessage("Product deleted successfully!");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Error deleting product: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setDeleting(false);
      setShowConfirmation(false);
      setProductToDelete(null);
    }
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price);
    setEditNewPrice(prod.newprice || "");
    setEditColors(prod.colors || []);
    setEditPictures(prod.pictures || []);
  };

  const toggleColor = (color) => {
    setEditColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Image resize function
  const resizeImage = (file, targetWidth = 768, targetHeight = 950) => {
    return new Promise((resolve) => {
      // Create image element properly for browser environment
      const img = document.createElement('img');
      const reader = new FileReader();

      reader.onload = (e) => { 
        img.src = e.target.result; 
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { 
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, file.type, 0.8); // 0.8 quality for better compression
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setMessage("Processing images...");
    
    try {
      const processedFiles = [];
      const uploadedUrls = [];

      // First, resize all images
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          setMessage(`File ${file.name} is not an image`);
          continue;
        }

        if (file.size > 5242880) {
          console.warn(`File too large: ${file.name}`);
          setMessage(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        // Resize the image
        const resizedFile = await resizeImage(file);
        processedFiles.push(resizedFile);
      }

      if (processedFiles.length === 0) {
        setMessage("No valid images to process");
        setUploadingImages(false);
        return;
      }

      setMessage("Uploading images...");

      // Now upload the resized images
      for (const file of processedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error for', file.name, ':', error);
          
          if (error.message.includes('Bucket not found')) {
            setMessage('Storage bucket "product-images" not found. Please create it manually in Supabase Dashboard');
            setTimeout(() => setMessage(""), 10000);
            break;
          } else if (error.message.includes('row-level security') || error.message.includes('RLS')) {
            setMessage('RLS Policy Error: Please run the SQL commands to fix storage policies');
            setTimeout(() => setMessage(""), 15000);
            break;
          } else if (error.message.includes('permission') || error.message.includes('denied')) {
            setMessage('Permission denied. Please check your Supabase storage policies');
            setTimeout(() => setMessage(""), 8000);
            break;
          } else {
            setMessage(`Error uploading ${file.name}: ${error.message}`);
          }
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setEditPictures(prev => [...prev, ...uploadedUrls]);
        setMessage(`Successfully uploaded ${uploadedUrls.length} image(s)`);
        setTimeout(() => setMessage(""), 3000);
      } else if (uploadedUrls.length === 0 && processedFiles.length > 0) {
        setMessage("No images were uploaded successfully");
        setTimeout(() => setMessage(""), 3000);
      }

    } catch (error) {
      console.error('Image upload error:', error);
      setMessage("Error uploading images: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const removeImage = async (indexToRemove) => {
    const imageUrl = editPictures[indexToRemove];
    
    try {
      if (imageUrl && imageUrl.includes('/product-images/')) {
        const urlParts = imageUrl.split('/product-images/');
        const fileName = urlParts[urlParts.length - 1];
        
        const { error } = await supabase.storage
          .from('product-images')
          .remove([fileName]);
          
        if (error) {
          console.error('Error deleting image from storage:', error);
        }
      }
    } catch (error) {
      console.error('Storage delete error:', error);
    }
    
    setEditPictures(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editPrice) {
      setMessage("Name and price are required!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          price: Number(editPrice),
          newprice: editNewPrice ? Number(editNewPrice) : null,
          colors: editColors,
          pictures: editPictures
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      setEditingProduct(null);
      setMessage("Product updated successfully!");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Error updating product: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const closeEditModal = () => {
    setEditingProduct(null);
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

      {/* Search Bar */}
      <motion.div 
        className="mb-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative">
          <motion.input
            type="text"
            placeholder=" Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-600 transition-all duration-200"
            variants={searchVariants}
            whileFocus="focus"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            !
          </div>
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                X
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Search Results Info */}
        <AnimatePresence>
          {searchTerm && (
            <motion.p 
              className="text-sm text-gray-600 mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.length === 0 
                ? `No products found for "${searchTerm}"` 
                : `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`
              }
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.p 
            className={`text-center mb-4 p-3 rounded ${
              message.includes("successfully") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
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

      {/* Loading State */}
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
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-6xl mb-4">X</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `Try searching for something else or clear the search to see all products.` 
              : 'Add your first product to get started!'
            }
          </p>
          {searchTerm && (
            <motion.button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Show All Products
            </motion.button>
          )}
        </motion.div>
      ) : (
        /* Products Grid */
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          key={searchTerm}
        >
          {filteredProducts.map((prod, index) => (
            <motion.div
              key={prod.id}
              className="border rounded-xl p-4 relative flex flex-col items-center shadow hover:shadow-lg transition"
              variants={cardVariants}
              whileHover="hover"
              custom={index}
              layout
            >
              <motion.div
                className="lg:w-full h-72 lg:h-58 mb-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Image
                  src={prod.pictures?.[0] || "/placeholder.png"}
                  alt={prod.name}
                  width={400}
                  height={550}
                  className="rounded object-cover w-full h-full"
                />
              </motion.div>

              <motion.h2 
                className="font-semibold text-lg text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
              >
                {prod.name}
              </motion.h2>

              <motion.div
                className="text-center mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                <p className="text-gray-600 font-medium">{prod.price} LE</p>
                {prod.newprice && <p className="text-gray-500 font-medium">New: {prod.newprice} LE</p>}
              </motion.div>

              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
              >
                <motion.button
                  onClick={() => openEditModal(prod)}
                  className="px-3 py-1 bg-fuchsia-600 text-white rounded transition hover:bg-fuchsia-700"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => showDeleteConfirmation(prod)}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && productToDelete && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={cancelDelete}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
              variants={confirmationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-6xl mb-4">Warning</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Product?</h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete
                </p>
                <p className="font-semibold text-gray-800">"{productToDelete.name}"?</p>
                <p className="text-sm text-red-500 mt-2">
                  This action cannot be undone!
                </p>
              </motion.div>

              <motion.div
                className="flex gap-3 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.button
                  onClick={cancelDelete}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!deleting ? "hover" : {}}
                  whileTap={!deleting ? "tap" : {}}
                  disabled={deleting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!deleting ? "hover" : {}}
                  whileTap={!deleting ? "tap" : {}}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        variants={loadingVariants}
                        animate="animate"
                      />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeEditModal}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                placeholder="Product Name *"
                className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:border-fuchsia-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />

              <motion.input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Price *"
                className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:border-fuchsia-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />

              <motion.input
                type="number"
                value={editNewPrice}
                onChange={(e) => setEditNewPrice(e.target.value)}
                placeholder="New Price (Optional)"
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:border-fuchsia-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              />

              {/* Colors */}
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <h3 className="text-sm font-semibold mb-2">Colors:</h3>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color, idx) => (
                    <motion.button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1 rounded border text-sm transition ${
                        editColors.includes(color) 
                          ? "bg-fuchsia-600 text-white border-fuchsia-600" 
                          : "bg-white text-gray-700 border-gray-300 hover:border-fuchsia-600"
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
                </div>
              </motion.div>

              {/* Images */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <h3 className="text-sm font-semibold mb-3">Images:</h3>
                
                {/* Current Images */}
                {editPictures.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {editPictures.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <Image
                          src={img}
                          alt={`Product ${idx + 1}`}
                          width={120}
                          height={120}
                          className="rounded object-cover w-full h-24"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload New Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-fuchsia-600 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <label 
                    htmlFor="image-upload" 
                    className={`cursor-pointer text-fuchsia-600 hover:text-fuchsia-700 font-medium ${
                      uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingImages ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-fuchsia-600 border-t-transparent rounded-full"
                          variants={loadingVariants}
                          animate="animate"
                        />
                        {message.includes("Processing") ? "Processing..." : "Uploading..."}
                      </span>
                    ) : (
                      'Upload Images'
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to select multiple images (Max 5MB each)<br/>
                    Images will be resized to 768x950px automatically
                  </p>
                </div>
              </motion.div>

              {/* Modal Actions */}
              <motion.div 
                className="flex justify-end gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <motion.button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={uploadingImages}
                >
                  {uploadingImages ? 'Processing...' : 'Save Changes'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}