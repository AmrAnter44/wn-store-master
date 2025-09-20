"use client";

import React, { useState, useEffect } from "react";
import AddProduct from "../add";
import RemoveProduct from "../remove";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const tabVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const contentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const buttonVariants = {
  idle: { scale: 1 },
  active: {
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  tap: { scale: 0.98 },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("add");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // تحقق من إذا المستخدم لوجين ولا لأ
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Checking authentication...
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Tabs */}
      <motion.div
        className="flex gap-4 mb-6 justify-center items-center"
        variants={tabVariants}
      >
        <motion.button
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            activeTab === "add"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("add")}
          variants={buttonVariants}
          initial="idle"
          animate={activeTab === "add" ? "active" : "idle"}
          whileHover="hover"
          whileTap="tap"
        >
          ➕ Add Product
        </motion.button>

        <motion.button
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            activeTab === "remove"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("remove")}
          variants={buttonVariants}
          initial="idle"
          animate={activeTab === "remove" ? "active" : "idle"}
          whileHover="hover"
          whileTap="tap"
        >
          ❌ Remove Product
        </motion.button>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {activeTab === "add" && <AddProduct />}
          {activeTab === "remove" && <RemoveProduct />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
