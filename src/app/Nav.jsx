"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
 import { useMyContext } from "../context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
   const { cart } = useMyContext();
   const cartCount = cart.length;

  /* ✅ تغيير حالة الـ Navbar عند الـ Scroll */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ✅ Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500  
        ${scrolled ? "bg-white/90 text-white shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-black">
          {/* ✅ Logo */}
          <Image src={scrolled ? "/darklogo.png" : "/whitelogo.png"} alt="Logo" width={60} height={60} />

          {/* ✅ Links */}
          <div className="flex gap-4">
            {/* زرار واتساب */}
            <div className="flex items-center gap-2 lg:gap-4 mr-4 lg:mr-9">
              <Link href="/cart" className="relative m-2">
                <FontAwesomeIcon className={`fa-solid fa-cart-shopping text-2xl  w-8 ${scrolled ? "bgg" : "text-white"}  shadow-2xl shadow-black`} icon={faCartShopping}  />
                {cartCount > 0 && (
                  <span className={`absolute -top-3 left-4 bg-white text-purple-00 text- w-5 h-5 flex items-center justify-center rounded-full ` }>
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link href="https://wa.me/+201070001014" className="m-2">
                <FontAwesomeIcon className={`fa-solid fa-cart-shopping text-3xl  w-9 ${scrolled ? "bgg" : "text-white"}  shadow-2xl shadow-black`} icon={faWhatsapp} />
              </Link>
            </div>
          </div>
        </div>
      </nav>
         <section
        className={`w-full min-h-[320px] bg-[url('/bg.png')] bg-fixed bg-cover bg-center md:bg-top flex items-center md:item-start justify-center md:justify-bottom`}
      >
        <div className="w-full min-h-[320px] bg-black/60 flex flex-col items-center justify-center text-center p-4">
          <h2 className="font-bold text-5xl md:text-6xl text-white">
            <span className="text-blue-600"></span> 
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mt-2">
           
          </p>
        </div>
      </section>

    </>
  );
  
}


