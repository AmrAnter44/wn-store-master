// 
"use client";
import { Facebook, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg text-white py-6 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        
        {/* Logo / Name */}
        <div className="text-lg font-semibold mb-4 md:mb-0">
          © {new Date().getFullYear()} Wn store
        </div>

        {/* Social Icons */}
        <div className="flex space-x-6">
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
          >
            <Facebook size={22} />
          </a>
          <a
            href="https://www.instagram.com/wn_store_eg_2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition"
          >
            <Instagram size={22} />
          </a>
          <a
            href="mailto:your@email.com"
            className="hover:text-green-400 transition"
          >
            <Mail size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}
