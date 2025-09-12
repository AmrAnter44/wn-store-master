"use client";

import React, { useState } from "react";
import AddProduct from "../add/page";       // سيكشن الإضافة
import RemoveProduct from "../remove/page"; // سيكشن الحذف


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("add"); // للتحكم بالسيكشن النشط

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 🔹 Tabs للتبديل بين Add و Remove */}
      <div className="flex gap-4 mb-6 mx-auto justify-center items-center">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "add" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("add")}
        >
          Add Product
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "remove" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("remove")}
        >
          Remove Product
        </button>
      </div>

      {/* 🔹 سيكشن الإضافة */}
      {activeTab === "add" && <AddProduct />}

      {/* 🔹 سيكشن الحذف */}
      {activeTab === "remove" && <RemoveProduct />}
    </div>
  );
}
