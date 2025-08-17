"use client";
import { FaCheckCircle } from "react-icons/fa";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-900 text-white">
      <FaCheckCircle className="text-green-500 text-6xl mb-4" />
      <h1>Your order has been placed and is now under review.</h1>
    </div>
  );
}
