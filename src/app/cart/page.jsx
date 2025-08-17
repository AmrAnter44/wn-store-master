"use client";
import { useMyContext } from "../../context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Cart() {
  const { cart, removeFromCart, addToCart, decreaseQuantity, clearCart ,item } = useMyContext();
  const router = useRouter();


  const total = cart.reduce(
    (acc, item) =>
      acc + (item.newPrice ? item.newPrice : item.price) * item.quantity,
    0
  );

  const goToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item, index) => (
              <li
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                className="flex justify-between items-center"
              >
                <div>
<div>
  {(() => {
    const colorIndex = item.colors.indexOf(item.selectedColor);
    return (
      <Image
        src={item.picture[colorIndex >= 0 ? colorIndex : 0]} // fallback لأول صورة
        alt={`Product image ${index}`}
        className="w-50 object-cover mb-4 rounded"
        width={100}
        height={400}
      />
    );
  })()}
</div>
                </div>
                <div className="w-40">
                  {/* <h2 className="p-2">{item.name}</h2> */}


                  <p className="p-2">
                    Price:{" "}
                    {item.newPrice ? (
                      <>

                        <span>{item.newPrice}.LE</span>
                      </>
                    ) : (
                      <>{item.price} .LE</>
                    )}
                  </p>

                  <p className="p-2">Quantity: {item.quantity}</p>
                  {/* <p className="p-2">
                    Total: {item.quantity * (item.newPrice ? item.newPrice : item.price)}.LE
                  </p> */}
                  <p className="p-2">
                    Color:{" "}
                    <span
                      style={{ backgroundColor: item.selectedColor }}
                      className="inline-block w-4 h-4 rounded-full border-2"
                    ></span>
                  </p>
                  <p className="p-2">Size: {item.selectedSize}</p>
                  <div className="flex gap-2 p-2 m-2">
                    {/* <button
                      className="text-green-500 text-2xl m-1"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </button>
                    <button
                      className="text-red-500 text-3xl m-1"
                      onClick={() =>
                        decreaseQuantity(item.id, item.selectedColor, item.selectedSize)
                      }
                    >
                      -
                    </button> */}

                  </div>
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

          <div className="mt-6 font-bold text-lg">Total: {total} .LE</div>
        </>
      )}

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
