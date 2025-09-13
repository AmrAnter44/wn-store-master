"use client";
import { useState } from "react";
import { useMyContext } from "../../context/CartContext";
import { useRouter } from "next/navigation";

export default function Page() {
  // جايب cart و clearCart من Context
  const { cart, clearCart } = useMyContext();

  // state لتخزين بيانات الفورم
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // الفانكشن اللي بتبعت الأوردر على واتساب
  const handleSendWhatsApp = () => {
    setErrorMessage(""); // مسح أي Error قديم

    // لو الكارت فاضي
    if (cart.length === 0) {
      setErrorMessage("Your cart is empty. Please add at least one product.");
      return;
    }

    // لو البيانات ناقصة
    if (!name || !address || !phone) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    // شرط رقم الموبايل
    if (!phone.startsWith("01")) {
      setErrorMessage("Phone number must start with 01.");
      return;
    }
    if (phone.length < 11) {
      setErrorMessage("Phone number must be at least 11 digits.");
      return;
    }

    // ----------------------------
    // تفاصيل المنتجات في الكارت
    // ----------------------------
    let cartDetails = "";
    cart.forEach((item) => {
      const itemPrice = item.newPrice ? item.newPrice : item.price;
      cartDetails += `${item.name}\n`;
      cartDetails += `Quantity: ${item.quantity}\n`;

      // إضافة اللون لو مش فاضي
      if (item.selectedColor && item.selectedColor.trim() !== "") {
        cartDetails += `Color: ${item.selectedColor}\n`;
      }

      // إضافة المقاس لو مش فاضي
      if (item.selectedSize && item.selectedSize.trim() !== "") {
        cartDetails += `Size: ${item.selectedSize}\n`;
      }

      cartDetails += `Price: ${itemPrice} EGP\n`;
      cartDetails += "-------------------------\n";
    });

    // ----------------------------
    // حساب إجمالي السعر
    // ----------------------------
    const total = cart.reduce(
      (acc, item) =>
        acc + (item.newPrice ? item.newPrice : item.price) * item.quantity,
      0
    );

    // ----------------------------
    // الرسالة النهائية اللي هتتبعت
    // ----------------------------
    const message =
      `WN Store:\n\n` +
      `Name: ${name}\n` +
      `Address: ${address}\n` +
      `Phone: ${phone}\n\n` +
      `Products:\n${cartDetails}` +
      `Total: ${total} EGP\n`;

    // رقم واتساب صاحب المتجر
    const yourWhatsAppNumber = "201211661802";
    const encodedMessage = encodeURIComponent(message);

    // فتح واتساب بالرسالة الجاهزة
    window.open(`https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`, "_blank");

    // مسح الكارت وتحويل لصفحة النجاح
    clearCart();
    router.push("/succses");
  };

  return (
    <div className="max-w-md min-h-screen mx-auto p-4 justify-center">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* رسالة الخطأ */}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
          {errorMessage}
        </div>
      )}

      {/* فورم البيانات */}
      <input
        type="text"
        placeholder="Name"
        className="border p-2 w-full mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="tel"
        placeholder="Phone"
        className="border p-2 w-full mb-3"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="Address"
        className="border p-2 w-full h-30 mb-3"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* زرار تأكيد الطلب */}
      <button
        onClick={handleSendWhatsApp}
        className="bg text-white px-4 py-2 rounded mx-auto"
      >
        Confirm Order via WhatsApp
      </button>
    </div>
  );
}
