"use client";
import { createContext, useContext, useState, useEffect } from "react";
const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // استرجاع cart من localStorage أول مرة
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // حفظ cart في localStorage عند أي تغيير
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  const clearCart = () => {
  setCart([]);
  localStorage.removeItem("cart"); // عشان يمسح من اللوكال ستورج
};

  // ✅ إضافة منتج (مع زيادة الكمية لو مضاف قبل كده)
const addToCart = (product) => {
  setCart((prev) => {
    const existing = prev.find(
      (item) =>
        item.id === product.id &&
        item.selectedColor === product.selectedColor &&
        item.selectedSize === product.selectedSize
    );

    if (existing) {
      return prev.map((item) =>
        item.id === product.id &&
        item.selectedColor === product.selectedColor &&
        item.selectedSize === product.selectedSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      return [...prev, { ...product, quantity: 1 }];
    }
  });
};


  // ✅ إزالة منتج بالكامل
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

  // ✅ تقليل الكمية (أو حذفه لو بقى 1)
  const decreaseQuantity = (id ,selectedColor, selectedSize) => {
    setCart((prev) =>
      prev
        .map((item) =>
          (item.id === id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ✅ عدد كل العناصر في السلة (مش عدد المنتجات المختلفة)
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
