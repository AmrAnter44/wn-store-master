"use client";

import React, { useState } from "react";
import AddProduct from "../add/page";
import RemoveProduct from "../remove/page";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const tabVariants = {
  hidden: { 
    opacity: 0, 
    y: -20 
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

const contentVariants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

const buttonVariants = {
  idle: {
    scale: 1,
    backgroundColor: "#e5e7eb"
  },
  active: {
    scale: 1.05,
    backgroundColor: "var(--primary-color)",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
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
  }
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("add");

  return (
    <motion.div 
      className="max-w-5xl mx-auto p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Tabs للتبديل بين Add و Remove */}
      <motion.div 
        className="flex gap-4 mb-6 mx-auto justify-center items-center"
        variants={tabVariants}
      >
        <motion.button
          className={`px-4 py-2 rounded ${
            activeTab === "add" ? "bg text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("add")}
          variants={buttonVariants}
          initial="idle"
          animate={activeTab === "add" ? "active" : "idle"}
          whileHover="hover"
          whileTap="tap"
        >
          Add Product
        </motion.button>
        
        <motion.button
          className={`px-4 py-2 rounded ${
            activeTab === "remove" ? "bg text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("remove")}
          variants={buttonVariants}
          initial="idle"
          animate={activeTab === "remove" ? "active" : "idle"}
          whileHover="hover"
          whileTap="tap"
        >
          Remove Product
        </motion.button>
      </motion.div>

      {/* Content Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* سيكشن الإضافة */}
          {activeTab === "add" && <AddProduct />}

          {/* سيكشن الحذف */}
          {activeTab === "remove" && <RemoveProduct />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}