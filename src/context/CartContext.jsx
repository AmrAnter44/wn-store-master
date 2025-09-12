"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // استرجاع cart من localStorage أول مرة
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // حفظ cart في localStorage عند أي تغيير
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // ✅ إضافة منتج (مع زيادة الكمية لو مضاف قبل كده)
  const addToCart = async (product) => {
    // جلب البيانات من DB لتأكيد كل التفاصيل (optional)
    let prod = product;
    if (!product.pictures) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", product.id)
        .single();
      if (!error && data) prod = data;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === prod.id &&
          item.selectedColor === prod.selectedColor &&
          item.selectedSize === prod.selectedSize
      );

      if (existing) {
        return prev.map((item) =>
          item.id === prod.id &&
          item.selectedColor === prod.selectedColor &&
          item.selectedSize === prod.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...prod, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id, selectedColor, selectedSize) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize)
      )
    );
  };

  const decreaseQuantity = (id, selectedColor, selectedSize) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <MyContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        cartCount,
        clearCart,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);

export default MyContext;