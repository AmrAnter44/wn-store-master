"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants (same as before)
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

const inputVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    height: "auto",
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const previewVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  idle: {
    scale: 1
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.98
  },
  loading: {
    scale: 1,
    opacity: 0.7
  }
};

const messageVariants = {
  hidden: {
    opacity: 0,
    y: -10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
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

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [newprice, setnewprice] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  const colorOptions = [
    "white","black","red","blue","green","yellow","orange","purple",
    "pink","brown","gray","beige","cyan","magenta","lime","indigo",
    "violet","turquoise","gold","silver","navy","maroon","olive","teal"
  ];
  const sizeOptions = ["S", "M", "L", "XL"];
  const typeOptions = ["dress", "casual", "Bag"];

  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((v) => v !== value));
    } else {
      setState([...state, value]);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    setMessage("Processing images...");

    try {
      const resizedFiles = [];
      const previews = [];

      for (let file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          setMessage(`File ${file.name} is not an image`);
          continue;
        }

        if (file.size > 5242880) { // 5MB
          console.warn(`File too large: ${file.name}`);
          setMessage(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        const img = new Image();
        const reader = new FileReader();

        const resizedFile = await new Promise((resolve) => {
          reader.onload = (e) => { img.src = e.target.result; };

          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const targetWidth = 768;
            const targetHeight = 950;
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            canvas.toBlob((blob) => {
              const newFile = new File([blob], file.name, { type: file.type });
              resolve(newFile);
              previews.push(URL.createObjectURL(newFile));
            }, file.type);
          };

          reader.readAsDataURL(file);
        });

        resizedFiles.push(resizedFile);
      }

      // إضافة الصور الجديدة للصور الموجودة بدلاً من استبدالها
      setFiles(prevFiles => [...prevFiles, ...resizedFiles]);
      setPreviewUrls(prevPreviews => [...prevPreviews, ...previews]);
      setMessage("");
    } catch (error) {
      console.error('Image processing error:', error);
      setMessage("Error processing images: " + error.message);
    } finally {
      setUploadingImages(false);
      // إعادة تعيين قيمة input لتمكين اختيار نفس الملفات مرة أخرى
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    // إزالة URL من الذاكرة لتجنب memory leaks
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const uploadImages = async () => {
    const pictureUrls = [];

    for (let file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("product-images") // تغيير اسم bucket ليتطابق مع Manage Products
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error for', file.name, ':', error);
          
          if (error.message.includes('Bucket not found')) {
            setMessage('❌ Storage bucket "product-images" not found. Please create it manually in Supabase Dashboard: Storage > Create Bucket > Name: "product-images" > Public: ✅');
            setTimeout(() => setMessage(""), 10000);
            break;
          } else if (error.message.includes('row-level security') || error.message.includes('RLS')) {
            setMessage('🔒 RLS Policy Error: Please run the SQL commands to fix storage policies. Check console for details.');
            console.error('RLS Error - Run this SQL in Supabase:', `
              ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
              -- OR create proper policies:
              ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
              CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
              CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
              CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
            `);
            setTimeout(() => setMessage(""), 15000);
            break;
          } else if (error.message.includes('permission') || error.message.includes('denied')) {
            setMessage('🚫 Permission denied. Please check your Supabase storage policies and make bucket public.');
            setTimeout(() => setMessage(""), 8000);
            break;
          } else {
            setMessage(`❌ Error uploading ${file.name}: ${error.message}`);
            setTimeout(() => setMessage(""), 5000);
          }
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          pictureUrls.push(urlData.publicUrl);
        }

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setMessage(`Error uploading ${file.name}: ${error.message}`);
        continue;
      }
    }

    return pictureUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!name || !price || colors.length === 0 || sizes.length === 0 || !type || files.length === 0) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      setMessage("Uploading images...");
      const pictureUrls = await uploadImages();

      if (pictureUrls.length === 0) {
        setMessage("No images were uploaded successfully. Please try again.");
        setLoading(false);
        return;
      }

      setMessage("Creating product...");

      const product = {
        name,
        price: Number(price),
        newprice: newprice ? Number(newprice) : null,
        description: description || "",
        pictures: pictureUrls,
        colors,
        sizes,
        type,
        owner_id: "dev-user-123"
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Product added successfully!");
        
        // تنظيف URLs من الذاكرة لتجنب memory leaks
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        
        // Reset form
        setName("");
        setPrice("");
        setnewprice("");
        setDescription("");
        setFiles([]);
        setPreviewUrls([]);
        setColors([]);
        setSizes([]);
        setType("");
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage("❌ " + (result.error || "Error adding product"));
        setTimeout(() => setMessage(""), 5000);
      }


    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
      setTimeout(() => setMessage(""), 5000);
    }

    setLoading(false);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-4 p-4 max-w-lg mx-auto"
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
        Add New Product
      </motion.h1>

      <motion.input 
        type="text" 
        placeholder="Product Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        className="p-2 border rounded-md w-full" 
        required 
        variants={inputVariants}
        whileFocus={{
          scale: 1.01,
          borderColor: "#8b5cf6",
          transition: { duration: 0.2 }
        }}
      />
      
      <motion.input 
        type="number" 
        placeholder="Price" 
        value={price} 
        onChange={(e) => setPrice(e.target.value)} 
        className="p-2 border rounded-md w-full" 
        required 
        variants={inputVariants}
        whileFocus={{
          scale: 1.01,
          borderColor: "#8b5cf6",
          transition: { duration: 0.2 }
        }}
      />
      
      <motion.input 
        type="number" 
        placeholder="New Price (optional)" 
        value={newprice} 
        onChange={(e) => setnewprice(e.target.value)} 
        className="p-2 border rounded-md w-full" 
        variants={inputVariants}
        whileFocus={{
          scale: 1.01,
          borderColor: "#8b5cf6",
          transition: { duration: 0.2 }
        }}
      />
      
      <motion.textarea 
        placeholder="Description (optional)" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        rows={4} 
        className="p-2 border rounded-md w-full" 
        variants={inputVariants}
        whileFocus={{
          scale: 1.01,
          borderColor: "#8b5cf6",
          transition: { duration: 0.2 }
        }}
      />

      {/* Colors */}
      <motion.div className="relative" variants={inputVariants}>
        <motion.button 
          type="button" 
          onClick={() => setShowColorOptions(!showColorOptions)} 
          className="w-full border p-2 rounded-md text-left flex justify-between items-center"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Colors (required) 
          <motion.span
            animate={{ rotate: showColorOptions ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </motion.button>
        
        <AnimatePresence>
          {showColorOptions && (
            <motion.div
              className="mt-2 border rounded-md p-2 flex flex-wrap gap-2 max-h-60 overflow-y-auto"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {colorOptions.map((color) => (
                <motion.label 
                  key={color} 
                  className="flex items-center gap-2 cursor-pointer transition-all hover:scale-105 p-1 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-[#b09dc1da]" 
                    checked={colors.includes(color)} 
                    onChange={() => handleCheckboxChange(color, colors, setColors)} 
                  />
                  <span className="w-5 h-5 rounded border" style={{ backgroundColor: color }}></span>
                  <span className="capitalize">{color}</span>
                </motion.label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sizes */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold">Sizes (required):</p>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <motion.button 
              key={size} 
              type="button" 
              onClick={() => handleCheckboxChange(size, sizes, setSizes)} 
              className={`px-3 py-1 rounded-full transition-all duration-300 ${
                sizes.includes(size) ? "bg-[#b09dc1da]" : "hover:bg-[#b09dc1da]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Type */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold">Type (required):</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <motion.button 
              key={t} 
              type="button" 
              onClick={() => setType(t)} 
              className={`px-3 py-1 rounded-full transition-all duration-300 ${
                type === t ? "bg-[#b09dc1da]" : "hover:bg-[#b09dc1da]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Images */}
      <motion.div variants={inputVariants}>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-600 transition">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={uploadingImages}
          />
          <label 
            htmlFor="image-upload" 
            className={`cursor-pointer text-purple-600 hover:text-purple-700 font-medium ${
              uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingImages ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"
                  variants={loadingVariants}
                  animate="animate"
                />
                Processing Images...
              </span>
            ) : (
              '📁 Select Images (Required)'
            )}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Select multiple images (Max 5MB each)<br />
            You can add more images by selecting again
          </p>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {previewUrls.length > 0 && (
          <motion.div 
            className="flex gap-2 flex-wrap mt-2"
            variants={previewVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {previewUrls.map((url, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={url} 
                  alt={`preview-${i}`} 
                  className="w-24 h-32 object-cover rounded-md" 
                />
                <motion.button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.p 
            className={`text-center p-3 rounded ${
              message.includes("successfully") || message.includes("✅") 
                ? "text-green-600 bg-green-50" 
                : message.includes("Processing") || message.includes("Uploading") || message.includes("Creating")
                ? "text-blue-600 bg-blue-50"
                : "text-red-600 bg-red-50"
            }`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button 
        type="submit" 
        disabled={loading || uploadingImages} 
        className={`mt-3 py-3 rounded-md transition font-medium ${
          loading || uploadingImages
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        }`}
        variants={buttonVariants}
        initial="idle"
        animate={loading ? "loading" : "idle"}
        whileHover={!loading && !uploadingImages ? "hover" : {}}
        whileTap={!loading && !uploadingImages ? "tap" : {}}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={loading ? "loading" : "idle"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  variants={loadingVariants}
                  animate="animate"
                />
                Adding Product...
              </>
            ) : uploadingImages ? (
              "Processing Images..."
            ) : (
              "Add Product"
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.form>
  );
}