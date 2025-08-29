import React from 'react'
import Image from 'next/image'
import bg from '../../public/bg.png'
export default function Img() {
  return (
   <div className="relative w-full h-svh">
  <Image 
    src={bg} 
    alt="background" 
    fill 
    className="object-cover" 
    priority
  />
</div>
  )
}
