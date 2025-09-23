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

  // ✅ FIXED: إضافة منتج مع حفظ السعر الصحيح (newprice إذا موجود)
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

    // ✅ FIXED: تحديد السعر الصحيح - newprice إذا موجود، وإلا price
    const correctPrice = prod.newprice && prod.newprice > 0 ? prod.newprice : prod.price;

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === prod.id &&
          item.selectedColor === prod.selectedColor &&
          item.selectedSize === prod.selectedSize
      );

      if (existing) {
        // إذا المنتج موجود، زود الكمية فقط
        return prev.map((item) =>
          item.id === prod.id &&
          item.selectedColor === prod.selectedColor &&
          item.selectedSize === prod.selectedSize
            ? { ...item, quantity: item.quantity + prod.quantity || item.quantity + 1 }
            : item
        );
      } else {
        // ✅ FIXED: إضافة المنتج مع السعر الصحيح مع property منفصل للسعر المُستخدم
        return [...prev, { 
          ...prod, 
          quantity: prod.quantity || 1,
          // ✅ إضافة السعر المستخدم كـ property منفصل للوضوح
          effectivePrice: correctPrice,
          // الحفاظ على الأسعار الأصلية كما هي
          originalPrice: prod.price,
          salePrice: prod.newprice || null
        }];
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

  // ✅ FIXED: حساب العدد والمجموع باستخدام السعر الصحيح
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // ✅ FIXED: حساب المجموع الكلي باستخدام السعر الفعال
  const cartTotal = cart.reduce((total, item) => {
    const itemPrice = item.effectivePrice || item.newprice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  return (
    <MyContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        cartCount,
        cartTotal, // ✅ إضافة المجموع الكلي
        clearCart,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);

export default MyContext;