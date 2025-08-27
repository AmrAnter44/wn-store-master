"use client";
import { useParams } from "next/navigation";
import products from "../../../data/product";
import Image from "next/image";
import Store from "../../Store";
import { useMyContext } from "../../../context/CartContext";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useMyContext();
  const product = products.find((p) => p.id == id);
  
  // أول لون وأول مقاس مختارين افتراضيًا
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selected, setSelected] = useState(product.picture[0] || "");
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!product) return <div className="p-10 text-center">Product not found</div>;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      setMessage({
        type: "error",
        text: "⚠ Please select a color and size",
      });
      return;
    }

    const productWithOptions = {
      ...product,
      selectedColor,
      selectedSize,
    };
    addToCart(productWithOptions);

    setMessage({
      type: "success",
      text: "🛒 Product has been added to your cart!",
    });
  };

  return (
    <>
      <div className="w-80% mx-auto p-6 bg-white flex lg:flex-row flex-col justify-evenly lg:cdh-180">
        <div className="flex flex-col-reverse">
          {/* الصور المصغرة */}
          <div className="h-[80px] mr-4 flex gap-3 m-1">
            {product.picture.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelected(img)}
                className="mb-2 cursor-pointer"
              >
                <Image src={img} alt={`thumb-${idx}`} width={60} height={90} />
              </div>
            ))}
          </div>

          {/* الصورة الرئيسية */}
          <div>
            <Image src={selected} alt="Main" width={400} height={500} />
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold my-3">{product.name}</h1>
          <p className="my-3 text-gray-700">{product.description}</p>

          {product.newPrice ? (
            <div className="flex justify-between">
              <p className="bgg font-bold text-xl text-start">
                {product.newPrice}.LE
              </p>
              <p className="text-gray-400 font-bold text-xl text-start line-through">
                {product.price}.LE
              </p>
            </div>
          ) : (
            <p className="  text-xl text-start">
              {product.price}.LE
            </p>
          )}

{/* الألوان */}
{/* الألوان */}
<div className="flex my-4">
  {product.colors.length >1 }
  {product.colors?.map((color, index) => {
    const isSelected = selectedColor === color;
    return (
      <button
        key={color}
        onClick={() => {
          setSelectedColor(color);
          setSelected(product.picture[index]); // يغير الصورة حسب اللون
        }}
        className={`w-8 h-8 rounded-full m-1 flex items-center justify-center ${
          isSelected ? "animate-spin-slow" : ""
        }`}
        style={{
          background: isSelected
            ? `conic-gradient(white 0deg 180deg, black 180deg 360deg)`
            : "transparent",
          padding: isSelected ? "2px" : "0px",
          border: isSelected ? "none" : "1px solid black",
        }}
      >
        <span
          className="w-full h-full rounded-full"
          style={{ backgroundColor: color }}
        ></span>
      </button>
    );
  })}
</div>

<style jsx>{`
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .animate-spin-slow {
    animation: spin-slow 2s linear infinite;
  }
`}</style>

<style jsx>{`
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .animate-spin-slow {
    animation: spin-slow 2s linear infinite;
  }
`}</style>






          {/* المقاسات */}
          <div className="flex my-3">
            {product.sizes?.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`font-bold text-gray-800 rounded-full border-2 m-1 text-sm w-8 h-8 flex items-center justify-center ${
                  selectedSize === size ? "border-black" : "border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* زر الإضافة للسلة */}
          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition my-2"
          >
            Add to Cart
          </button>

          {/* مكان الرسالة ثابت */}
          <div className="h-6 flex items-center">
            {message.text && (
              <p
                className={`font-medium ${
                  message.type === "error"
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>

          <div className="mt-auto text-gray-500">
            <h3 className=" border-gray-200 mb-5">Description</h3>
            <ul className="list-disc list-inside">
              <li>Fast delivery and shipping</li>
              <li>Secure online payment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* منتجات مشابهة */}
      <div className="w-80% mx-auto text-center bg-white">
        <h4 className="text-2xl font-bold my-3 mx-auto bg-white bgg">You may also like</h4>
        <Store />
      </div>
    </>
  );
}
