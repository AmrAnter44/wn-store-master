"use client";
import React from 'react'
import Image from 'next/image'
import logo from '../../public/white.png'
import bg from '../../public/bg.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from 'next/link';
import { useMyContext } from "../context/CartContext";

export default function Nav() {
  const { cart } = useMyContext();
  const cartCount = cart.length;

  return (
    <>
      <div className="sticky top-0 z-50">
        <div className="bg h-16 flex items-center justify-between text-2xl font-bold text-gray-800 border-b-2 border-gray-400">
          <Link href="/"><Image src={logo} width={100} height={100} className="mr-8" alt="logo" /> </Link>

          <div className="flex items-center gap-2 lg:gap-4 mr-4 lg:mr-9">

            <div>
                          <Link href="/cart" className="relative m-2">
              <FontAwesomeIcon className="fa-solid fa-cart-shopping text-white w-8" icon={faCartShopping} />
              {cartCount > 0 && (
                <span className="absolute -top-3 left-4 bg-white text-purple-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="https://wa.me/+201070001014" className='m-2'>
              <FontAwesomeIcon className="fa-brands fa-whatsapp text-white text-3xl" icon={faWhatsapp} />
            </Link>
            </div>

          </div>
        </div>
      </div>

      {/* الصورة بعرض الشاشة تحت الـ Nav */}
<div className="relative w-full h-svh">
  <Image 
    src={bg} 
    alt="background" 
    fill 
    className="object-cover" 
    priority
  />
</div>
    </>
  )
}
