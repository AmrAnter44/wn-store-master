"use client";
import { useMyContext } from "../../context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Cart() {
  // جايب كل الداتا والفانكشنز من الـ Context
  const { cart, removeFromCart } = useMyContext();
  const router = useRouter();

  // حساب إجمالي الفاتورة
  const total = cart.reduce(
    (acc, item) =>
      acc + (item.newPrice ? item.newPrice : item.price) * item.quantity,
    0
  );

  // فانكشن بتوديك لصفحة الـ Checkout
  const goToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-16">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {/* لو الكارت فاضي */}
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {/* عرض كل المنتجات في الكارت */}
          <ul className="space-y-4">
            {cart.map((item, index) => (
              <li
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                className="flex justify-between items-center"
              >
                {/* صورة المنتج */}
                <div>
                  <div>
                    {(() => {
                      const colorIndex = item.colors.indexOf(item.selectedColor);
                      return (
                        <Image
                          src={item.picture[colorIndex >= 0 ? colorIndex : 0]} // fallback لأول صورة لو مفيش لون محدد
                          alt={`Product image ${index}`}
                          className="w-50 object-cover mb-4 rounded"
                          width={100}
                          height={400}
                        />
                      );
                    })()}
                  </div>
                </div>

                {/* تفاصيل المنتج */}
                <div className="w-40">
                  <p className="p-2">
                    Price:{" "}
                    {item.newPrice ? (
                      <span>{item.newPrice}.LE</span>
                    ) : (
                      <>{item.price} .LE</>
                    )}
                  </p>

                  <p className="p-2">Quantity: {item.quantity}</p>

                  {/* عرض اللون فقط لو في أكتر من لون */}
                  {item.colors && item.colors.length > 1 && (
                    <p className="p-2">
                      Color:{" "}
                      <span
                        style={{ backgroundColor: item.selectedColor }}
                        className="inline-block w-4 h-4 rounded-full border-2"
                      ></span>
                    </p>
                  )}

                  {/* عرض المقاس */}
                  <p className="p-2">Size: {item.selectedSize}</p>

                  {/* زرار الحذف */}
                  <button
                    className="text-red-400 text-xl hover:text-red-500 m-5 "
                    onClick={() =>
                      removeFromCart(item.id, item.selectedColor, item.selectedSize)
                    }
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* الإجمالي */}
          <div className="mt-6 font-bold text-lg">Total: {total} .LE</div>
        </>
      )}

      {/* زرار الذهاب لطلب الأوردر */}
      <div>
        {cart.length >= 1 && (
          <div>
            <button
              className="bg hover:bg-fuchsia-500 text-white font-bold py-2 px-4 rounded w-full"
              onClick={goToCheckout}
            >
              Order Now
            </button>
            <h4>
              To make the ordering process easier for both you and us, your order details will be
              sent to WhatsApp for quick confirmation.
            </h4>
          </div>
        )}
      </div>
    </div>
  );
}
