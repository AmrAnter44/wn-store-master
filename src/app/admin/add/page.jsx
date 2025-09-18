"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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

  const colorOptions = [
    "white","black","red","blue","green","yellow","orange","purple",
    "pink","brown","gray","beige","cyan","magenta","lime","indigo",
    "violet","turquoise","gold","silver","navy","maroon","olive","teal"
  ];
  const sizeOptions = ["S", "M", "L", "XL"];
  const typeOptions = ["dress", "casual"];

  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((v) => v !== value));
    } else {
      setState([...state, value]);
    }
  };

  const resizeAndPreviewFiles = async (selectedFiles) => {
    const resizedFiles = [];
    const previews = [];

    for (let file of selectedFiles) {
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

    setFiles(resizedFiles);
    setPreviewUrls(previews);
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
      let pictureUrls = [];

      for (let file of files) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          continue;
        }

        const { data: urlData, error: urlError } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        if (urlError) {
          console.error("Get public URL error:", urlError);
          continue;
        }

        pictureUrls.push(urlData.publicUrl);
      }

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
        setMessage("Product added successfully!");
        setName("");
        setPrice("");
        setnewprice("");
        setDescription("");
        setFiles([]);
        setPreviewUrls([]);
        setColors([]);
        setSizes([]);
        setType("");
      } else {
        setMessage(result.error || "Error adding product");
      }

      console.log("Response:", result);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
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
      <motion.input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={(e) => resizeAndPreviewFiles([...e.target.files])} 
        className="border p-2 rounded-md" 
        required 
        variants={inputVariants}
      />
      
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
              <motion.img 
                key={i} 
                src={url} 
                alt={`preview-${i}`} 
                className="w-24 h-32 object-cover rounded-md" 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        type="submit" 
        disabled={loading} 
        className="mt-3 bg text-white py-2 rounded-md transition"
        variants={buttonVariants}
        initial="idle"
        animate={loading ? "loading" : "idle"}
        whileHover={!loading ? "hover" : {}}
        whileTap={!loading ? "tap" : {}}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={loading ? "loading" : "idle"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? "Adding..." : "Add Product"}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {message && (
          <motion.p 
            className="mt-2 text-center text-gray-600"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
}