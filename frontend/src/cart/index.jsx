import React from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { Footer3 } from "../home/components/Footer3";
import { useCart } from "../context/CartContext";

function QtyControl({ item, onChange }) {
  return (
    <div className="inline-flex items-center border border-gray-300">
      <button
        onClick={() => onChange(item.quantity - 1)}
        className="flex size-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
        aria-label="Decrease quantity"
      >
        <FiMinus className="size-3.5" />
      </button>
      <span className="w-10 text-center text-sm">{item.quantity}</span>
      <button
        onClick={() => onChange(item.quantity + 1)}
        className="flex size-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
        aria-label="Increase quantity"
      >
        <FiPlus className="size-3.5" />
      </button>
    </div>
  );
}

export default function Page() {
  const { cart, updateItem, removeItem, emptyCart } = useCart();
  const { items, total } = cart;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Shopping Cart
          </h1>
          <span className="mx-auto block h-0.5 w-16 bg-gray-900" />
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-6 text-gray-500">Your cart is empty.</p>
            <Link
              to="/"
              className="inline-block border border-gray-400 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="hidden border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[2fr_1fr_1fr_auto] md:gap-4">
                <span>Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Subtotal</span>
                <span className="w-8" />
              </div>

              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="grid grid-cols-1 items-center gap-4 border-b border-gray-100 py-5 md:grid-cols-[2fr_1fr_1fr_auto]"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.image_url ||
                        "https://placehold.co/100x100?text=No+Image"
                      }
                      alt={item.name}
                      className="size-20 shrink-0 object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-center">
                    <QtyControl
                      item={item}
                      onChange={(q) => updateItem(item.product_id, q)}
                    />
                  </div>

                  <div className="text-sm font-semibold text-gray-900 md:text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="justify-self-start text-gray-400 transition-colors hover:text-rose-500 md:justify-self-end"
                    aria-label="Remove item"
                  >
                    <FiTrash2 className="size-5" />
                  </button>
                </div>
              ))}

              <div className="mt-6 flex items-center justify-between">
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-rose-500"
                >
                  ← Continue Shopping
                </Link>
                <button
                  onClick={emptyCart}
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-rose-500"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="h-fit border border-gray-200 p-6">
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Cart Total
              </h2>
              <div className="flex justify-between border-b border-gray-100 py-3 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-3 text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">Free</span>
              </div>
              <div className="flex justify-between py-4 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-2 block w-full bg-gray-900 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-rose-500"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer3 />
    </div>
  );
}
